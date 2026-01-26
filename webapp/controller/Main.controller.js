
sap.ui.define(
	[
		"./BaseController",
		"sap/ui/model/json/JSONModel",
		"../model/models",
		"../model/formatter",
		"../model/mapper",
		"../model/API",
		"sap/m/MessageBox",
	],
	function (
		BaseController,
		JSONModel,
		models,
		formatter,
		mapper,
		API,
		MessageBox
	) {
		"use strict";

		return BaseController.extend("integdashboard.controller.Main", {
			formatter: formatter,
			onInit: async function () {
				this.setModel(models.createMainModel(), "main");
				this.setModel(new JSONModel(), "integrationsModel");
				const oFilterModel = models.createFilterModel();
				this.oBundle = this.getOwnerComponent()
					.getModel("i18n")
					.getResourceBundle();
				await this._setFiltersModel(oFilterModel);
				this.getRouter()
					.getRoute("main")
					.attachPatternMatched(this._onObjectMatched, this);
			},
			_onObjectMatched: async function (oEvent) {
				this.onSearch();
			},
			_setFiltersModel: async function (oFilterModel) {
				try {
					this.showBusy(0);
					const [systems, idFlows] = await Promise.all([
						API.getEntitySet(
							this.getOwnerComponent().getModel("ZLOG_PID999_INTEGRATION_SRV"),
							"/GetSystemSet"
						),
						API.getEntitySet(
							this.getOwnerComponent().getModel("ZLOG_PID999_INTEGRATION_SRV"),
							"/GetIDFlowSet"
						),
					]);
					const systemOptions = systems.results.map((item) => {
						return {
							key: item.IDSystem,
							text: item.Description,
						};
					});
					oFilterModel.setProperty("/systemOptions", systemOptions);

					const descriptions = idFlows.results
						.map((item) => ({
							key: item.IDFlow,
							text: `${item.IDFlow} - ${item.Description}`,
						}))
						.sort((a, b) => {
							return a.key.localeCompare(b.key, undefined, {
								numeric: true,
								sensitivity: "base",
							});
						});

					oFilterModel.setProperty("/description", descriptions);
					this.setModel(oFilterModel, "filterModel");
				} catch (error) {
					MessageBox.error(this.oBundle.getText("dataError"));
				} finally {
					this.hideBusy(0);
				}
			},
			createGroupHeader: function (oGroup) {
				const sCode = oGroup.key;
				const sKey = mapper.getRootKeyByCode(sCode);
				const sTitle = this.oBundle.getText(sKey);

				return new sap.m.GroupHeaderListItem({
					title: sTitle,
					upperCase: false,
				}).addStyleClass("group-code-" + sCode);
			},

			_buildFilters: function () {
				const oFilterModel = this.getModel("filterModel");
				const aFilters = [];

				const fromDateTime = oFilterModel.getProperty("/fromDate");
				const toDateTime = oFilterModel.getProperty("/toDate");
				const sIntegrationId = oFilterModel.getProperty("/integrationId");
				const aDescriptions =
					oFilterModel.getProperty("/selectedDescriptions") || [];
				const aSystems = oFilterModel.getProperty("/selectedSys") || [];
				const sStatus = oFilterModel.getProperty("/status");

				if (!this._checkDateRange(fromDateTime, toDateTime)) {
					oFilterModel.setProperty("/fromDate", null);
					oFilterModel.setProperty("/toDate", null);
					return null;
				}

				if (fromDateTime && toDateTime) {
					const sFormattedFromDate =
						formatter.dateToBackendDate(fromDateTime) +
						formatter.dateToBackendTime(fromDateTime);
					const sFormattedToDate =
						formatter.dateToBackendDate(toDateTime) +
						formatter.dateToBackendTime(toDateTime);
					const oDateTimeFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter(
								"TIMESTAMP",
								sap.ui.model.FilterOperator.GE,
								sFormattedFromDate
							),
							new sap.ui.model.Filter(
								"TIMESTAMP",
								sap.ui.model.FilterOperator.LE,
								sFormattedToDate
							),
						],
						and: true,
					});

					aFilters.push(oDateTimeFilter);
				}
				if (sIntegrationId && sIntegrationId.length > 0) {
					aFilters.push(
						new sap.ui.model.Filter(
							"ID_INT",
							sap.ui.model.FilterOperator.EQ,
							sIntegrationId
						)
					);
				}
				if (aDescriptions.length > 0) {
					const aDescFilters = aDescriptions.map((desc) => {
						return new sap.ui.model.Filter(
							"ID_FLOW",
							sap.ui.model.FilterOperator.EQ,
							desc.split(" - ")[0].trim()
						);
					});
					aFilters.push(
						new sap.ui.model.Filter({
							filters: aDescFilters,
							and: false,
						})
					);
				}
				if (aSystems.length > 0) {
					const aSysFilters = aSystems.map((s) => {
						if (s >= "") {
							return new sap.ui.model.Filter(
								"ID_SYST",
								sap.ui.model.FilterOperator.EQ,
								s
							);
						}
					});
					aFilters.push(
						new sap.ui.model.Filter({
							filters: aSysFilters,
							and: false,
						})
					);
				}
				if (sStatus) {
					//success between 200 e 299
					//error not between 200 e 299
					let oStatusFilter;
					if (sStatus === "Success") {
						oStatusFilter = new sap.ui.model.Filter(
							"STATUS",
							sap.ui.model.FilterOperator.BT,
							"200",
							"299"
						);
					} else if (sStatus === "Error") {
						oStatusFilter = new sap.ui.model.Filter({
							filters: [
								new sap.ui.model.Filter(
									"STATUS",
									sap.ui.model.FilterOperator.LT,
									"200"
								),
								new sap.ui.model.Filter(
									"STATUS",
									sap.ui.model.FilterOperator.GT,
									"299"
								),
							],
							and: false,
						});
					}
					if (oStatusFilter) {
						aFilters.push(oStatusFilter);
					}
				}

				return aFilters;
			},
			onSearch: async function () {
				const aFilters = this._buildFilters();
				if (!aFilters) {
					return;
				}
				try {
					this.showBusy(0);
					const data = await API.getEntitySet(
						this.getOwnerComponent().getModel("ZLOG_PID999_INTEGRATION_SRV"),
						"/GetLogsSet",
						{
							filters: aFilters,
						}
					);
					data.results.forEach((element) => {
						if (element.STATUS >= 200 && element.STATUS <= 299) {
							element.color = "Success";
							element.statusText = "Success";
						} else {
							element.color = "Error";
							element.statusText = "Error";
						}
						element.IntegrationDateTime = formatter.formatBackendTimestamp(element.TIMESTAMP.trim());
					});
					this.getModel("integrationsModel").setProperty("/", data.results);
				} catch (error) {
					MessageBox.error(this.oBundle.getText("dataError"));
				} finally {
					this.getModel("main").setProperty("/visibility", true);
					this.hideBusy(0);
				}
			},
			_checkDateRange: function (fromDate, toDate) {
				if (!fromDate && !toDate) {
					MessageBox.error(this.oBundle.getText("selectDateRange"));
					return false;
				}

				if (fromDate && toDate) {
					const oFrom = new Date(fromDate);
					const oTo = new Date(toDate);

					if (isNaN(oFrom.getTime()) || isNaN(oTo.getTime())) {
						MessageBox.error(this.oBundle.getText("invalidDate"));
						return false;
					}

					if (oFrom > oTo) {
						MessageBox.error(this.oBundle.getText("dateErrorRange"));
						return false;
					}
				}

				return true;
			},
			onFilterBarClear: function () {
				const oFilterModel = this.getModel("filterModel");
				oFilterModel.setProperty("/fromDate", null);
				oFilterModel.setProperty("/toDate", null);
				oFilterModel.setProperty("/integrationId", []);
				oFilterModel.setProperty("/selectedDescriptions", "");
				oFilterModel.setProperty("/selectedSys", "");
				oFilterModel.setProperty("/status", "");

				const oTable = this.byId("integrationTable");
				if (oTable && oTable.getBinding("items")) {
					oTable.getBinding("items").filter([]);
				}
				this.getModel("main").setProperty("/visibility", false);
			},

			onTabSelect: function (oEvent) {
				const oTable = oEvent.getSource().getAggregation("content")[0];
				const oBinding = oTable.getBinding("items");
				const sKey = oEvent.getParameter("key");
				let aFilters = [];
				if (sKey === "Success") {
					aFilters.push(
						new sap.ui.model.Filter(
							"statusText",
							sap.ui.model.FilterOperator.EQ,
							"Success"
						)
					);
				} else if (sKey === "Error") {
					aFilters.push(
						new sap.ui.model.Filter(
							"statusText",
							sap.ui.model.FilterOperator.EQ,
							"Error"
						)
					);
				} else if (sKey === "All") {
					aFilters = [];
				}
				oBinding.filter(aFilters);
			},
			getStream: async function (oEvent) {
				const oBtn = oEvent.getSource();
				const sStreamType = oBtn.getAggregation('tooltip')
				const sCpiIntegrationId = oBtn._getPropertiesToPropagate().oBindingContexts.integrationsModel.getObject().ID_CPIRUN;
				const sIdFlow = oBtn._getPropertiesToPropagate().oBindingContexts.integrationsModel.getObject().ID_FLOW;
				try {
					this.showBusy(0);
					const oResult = await API._downloadStream(sCpiIntegrationId, sStreamType);
					const filename = `${sIdFlow}_${sCpiIntegrationId}_${sStreamType}`;
					this._saveBlob(oResult.blob, filename);
				} catch (error) {
					console.error(error);
					MessageBox.error(this.oBundle.getText("streamDownloadError"));	
				} finally {
					this.hideBusy(0);
				}
			},
			_saveBlob: function (oBlob, sFileName) {
			if (window.navigator && window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveOrOpenBlob(oBlob, sFileName);
			} else {
				const oUrl = window.URL || window.webkitURL;
				const oBlobUrl = oUrl.createObjectURL(oBlob);	
				const oLink = document.createElement("a");
				oLink.href = oBlobUrl;
				oLink.download = sFileName;
				document.body.appendChild(oLink);
				oLink.click();
				document.body.removeChild(oLink);
				oUrl.revokeObjectURL(oBlobUrl);
			}
		},
			
			// onTableRowSelectionChange: function (oEvent) {
			// 	const sIntegrationId = oEvent
			// 		.getParameters()
			// 		.listItem.getBindingContext("integrationsModel")
			// 		.getObject().ID_INT;
			// 	this.getRouter().navTo("Detail", {
			// 		integrationId: sIntegrationId,
			// 	});
			// 	oEvent.getSource().removeSelections(true);
			// },
		});
	}
);
