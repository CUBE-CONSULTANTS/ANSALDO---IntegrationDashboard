/* eslint-disable no-debugger */
/* eslint-disable no- */
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

				// const fromDateTime = oFilterModel.getProperty("/fromDate");
				// const toDateTime = oFilterModel.getProperty("/toDate");
				const sIntegrationId = oFilterModel.getProperty("/integrationId");
				const aDescriptions =
					oFilterModel.getProperty("/selectedDescriptions") || [];
				const aSystems = oFilterModel.getProperty("/selectedSys") || [];
				const sStatus = oFilterModel.getProperty("/status");

				// if (!this._checkDateRange(fromDateTime, toDateTime)) {
				// 	oFilterModel.setProperty("/fromDate", null);
				// 	oFilterModel.setProperty("/toDate", null);
				// 	return null;
				// }

				// if (fromDateTime) {
				// 	const sFromDate = formatter.dateToBackendDate(fromDateTime);
				// 	const sFromTime = formatter.dateToBackendTime(fromDateTime);

				// 	aFilters.push(
				// 		new sap.ui.model.Filter({
				// 			filters: [
				// 				new sap.ui.model.Filter(
				// 					"DATA",
				// 					sap.ui.model.FilterOperator.GT,
				// 					sFromDate
				// 				),
				// 				new sap.ui.model.Filter({
				// 					filters: [
				// 						new sap.ui.model.Filter(
				// 							"DATA",
				// 							sap.ui.model.FilterOperator.EQ,
				// 							sFromDate
				// 						),
				// 						new sap.ui.model.Filter(
				// 							"TIME",
				// 							sap.ui.model.FilterOperator.GE,
				// 							sFromTime
				// 						),
				// 					],
				// 					and: true,
				// 				}),
				// 			],
				// 			and: false,
				// 		})
				// 	);
				// }

				// if (toDateTime) {
				// 	const sToDate = formatter.dateToBackendDate(toDateTime);
				// 	const sToTime = formatter.dateToBackendTime(toDateTime);

				// 	aFilters.push(
				// 		new sap.ui.model.Filter({
				// 			filters: [
				// 				new sap.ui.model.Filter(
				// 					"DATA",
				// 					sap.ui.model.FilterOperator.LT,
				// 					sToDate
				// 				),
				// 				new sap.ui.model.Filter({
				// 					filters: [
				// 						new sap.ui.model.Filter(
				// 							"DATA",
				// 							sap.ui.model.FilterOperator.EQ,
				// 							sToDate
				// 						),
				// 						new sap.ui.model.Filter(
				// 							"TIME",
				// 							sap.ui.model.FilterOperator.LE,
				// 							sToTime
				// 						),
				// 					],
				// 					and: true,
				// 				}),
				// 			],
				// 			and: false,
				// 		})
				// 	);
				// }
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
						if (element.STATUS >= 200 && element.STATUS <= 299 ) {
								element.color = 'Success'
								element.statusText = 'Success'
							} else {
								element.color = 'Error'
								element.statusText = 'Error'
							}
						element.IntegrationDateTime = formatter.mergeDateAndTime(
							element.DATA,
							element.TIME,
						);
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
				const oBinding = oTable.getBinding("rows");
				const sKey = oEvent.getParameter("key");
				let aFilters = [];
				if (sKey === "Ok") {
					aFilters.push(
						new sap.ui.model.Filter(
							"Status",
							sap.ui.model.FilterOperator.EQ,
							"Success"
						)
					);
				} else if (sKey === "Ko") {
					aFilters.push(
						new sap.ui.model.Filter(
							"Status",
							sap.ui.model.FilterOperator.EQ,
							"Error"
						)
					);
				} else if (sKey === "All") {
					aFilters = [];
				}
				oBinding.filter(aFilters);
			},
			onTableRowSelectionChange: function (oEvent) {
				const sIntegrationId = oEvent
					.getParameters()
					.listItem.getBindingContext("integrationsModel")
					.getObject().ID_INT;
				this.getRouter().navTo("Detail", {
					integrationId: sIntegrationId,
				});
				oEvent.getSource().removeSelections(true);
			},
		});
	}
);
