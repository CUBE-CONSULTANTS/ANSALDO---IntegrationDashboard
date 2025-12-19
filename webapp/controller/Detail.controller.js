/* eslint-disable no-debugger */
/* eslint-disable no-nested-ternary */
/* eslint-disable no- */
sap.ui.define(
	[
		"./BaseController",
		"../model/models",
		"../model/formatter",
		"../model/mapper",
		"../model/API",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
	],
	function (BaseController, models, formatter, mapper, API, JSONModel, MessageBox) {
		"use strict";

		return BaseController.extend("integdashboard.controller.Detail", {
			formatter: formatter,
			onInit: function () {
				this.getRouter().getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
				this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				this.setModel(new JSONModel(), "detailModel");
			},
			_onObjectMatched: async function (oEvent) {
				const sIntegrationId = oEvent.getParameter("arguments").integrationId;
				await this.setLogsTable(sIntegrationId);
				const oIntegration = this.getModel("detailModel").getProperty("/logs/0");
				const sRootKey = mapper.getRootKeyByCode(oIntegration.ID_FLOW);
				oIntegration.Description = this.oBundle.getText(sRootKey);
				const oHeaderObj = {
					IntegrationId: oIntegration.ID_INT,
					Code: oIntegration.ID_FLOW,
					Description: oIntegration.Description,
					Status: oIntegration.STATUS,
					IntegrationDate: oIntegration.DATA,
					IntegrationTime: oIntegration.TIME,
				};
				const sTitle = sRootKey
					? this.oBundle.getText(sRootKey) +
					  "  " +
					  oIntegration.ID_INT
					: oIntegration.ID_INT;
				this.getModel("detailModel").setProperty("/title", sTitle);
				this.getModel("detailModel").setProperty("/header", oHeaderObj);
				this._renderHeaderContent();
				this._renderSimpleForm();
				this._prepareDynamicTableData();
			},
			setLogsTable: async function (sIntegrationId) {
				this.showBusy(0)
				try {
					const logs = await API.getEntitySet(
						this.getOwnerComponent().getModel("ZLOG_PID999_INTEGRATION_SRV"),
						"/GetLogsSet",
						{
							filters: [
								new sap.ui.model.Filter(
									"ID_INT",
									sap.ui.model.FilterOperator.EQ,
									sIntegrationId
								),
							],
							expands: ["Results"],
						}
					);
					const oLogEntry = logs.results[0]?.Results?.results[0];
					if (!oLogEntry) return;
					const sRawData = oLogEntry.JSONREQUEST || "";
					let oParsedData;

					if (sRawData.trim().startsWith("<")) {
						oParsedData = this._parseXmlToJson(sRawData);
					} else {
						try {
							oParsedData = JSON.parse(sRawData || "{}");
						} catch (e) {
							oParsedData = { Error: "Invalid Format", RawContent: sRawData };
						}
					}

					this.getModel("detailModel").setProperty(
						"/logs",
						logs.results[0].Results.results
					);

					this.getModel("detailModel").setProperty(
						"/rawJsonContent",
						oParsedData
					);
				} catch (error) {
					MessageBox.error(this.oBundle.getText("dataError"), error);
				} finally {
					this.hideBusy(0)
				}
			},
			_parseXmlToJson: function (sXml) {
				const oParser = new DOMParser();
				const oXmlDoc = oParser.parseFromString(sXml, "text/xml");
				const fParseNode = (oNode) => {
					const oObj = {};
					if (oNode.nodeType === 1) {
						if (oNode.hasChildNodes()) {
							for (let i = 0; i < oNode.childNodes.length; i++) {
								const oChild = oNode.childNodes.item(i);
								if (oChild.nodeName === "#text") {
									const sText = oChild.nodeValue.trim();
									if (sText) return sText;
								} else {
									const sName = oChild.nodeName;
									const vValue = fParseNode(oChild);
									if (oObj[sName]) {
										if (!Array.isArray(oObj[sName]))
											oObj[sName] = [oObj[sName]];
										oObj[sName].push(vValue);
									} else {
										oObj[sName] = vValue;
									}
								}
							}
						}
					}
					return oObj;
				};
				return fParseNode(oXmlDoc.documentElement);
			},
			_renderHeaderContent: function () {
				const oDetailModel = this.getModel("detailModel");
				if (!oDetailModel) return;

				let oHeader = oDetailModel.getProperty("/header") || {};
				if (Array.isArray(oHeader)) {
					oHeader = oHeader[0] || {};
				}

				const oHBox = this.byId("headerContentBox");
				if (!oHBox) return;
				oHBox.destroyItems();

				const aKeys = Object.keys(oHeader);
				const nGroupSize = 3;
				for (let i = 0; i < aKeys.length; i += nGroupSize) {
					const oVBox = new sap.m.VBox({ items: [] });

					aKeys.slice(i, i + nGroupSize).forEach((sKey) => {
						let v = oHeader[sKey];
						if (sKey === "IntegrationDate")
						v = formatter.formatJsonDate(formatter.formatJsonValue(v));
						if (sKey === "IntegrationTime")
						v = formatter.formatJsonTime(formatter.formatJsonValue(v));
						const sTitle = this.oBundle.hasText(sKey) ? this.oBundle.getText(sKey) : sKey;

						oVBox.addItem(
							new sap.m.ObjectAttribute({
								title: sTitle,
								text: v || "-",
							})
						);
					});

					oHBox.addItem(oVBox);
				}
			},
			_renderSimpleForm: function () {
        const oDetailModel = this.getModel("detailModel");
        const oRawContent = oDetailModel.getProperty("/rawJsonContent");
        const oHeader = oDetailModel.getProperty("/header");
        const oSimpleForm = this.byId("overviewForm");
        
        if (!oSimpleForm || !oRawContent) return;
        oSimpleForm.destroyContent();
        const aFlatData = mapper.flattenData(oRawContent);
        const oFirstRecord = aFlatData[0] || {};
        const aKeyFields = mapper.getKeyFieldsByCode(oHeader.Code, oRawContent);

        const nCols = 3;
        for (let i = 0; i < aKeyFields.length; i += nCols) {
          const oHBox = new sap.m.HBox({
            width: "100%",
            wrap: "Wrap"
          }).addStyleClass("sapUiSmallMarginBottom");

          aKeyFields.slice(i, i + nCols).forEach((sKey) => {
            let v = oFirstRecord[sKey] || "-";
						if (sKey.includes('date') || sKey.includes('Date'))	
            v = (typeof v === "string" && /^\d{8}$/.test(v)) ? formatter.formatJsonDate(v) : v;

            oHBox.addItem(new sap.m.VBox({
              width: "33%",
              items: [
                new sap.m.Label({ 
                    text: this.oBundle.hasText(sKey) ? this.oBundle.getText(sKey) : sKey.split("_").pop(), 
                    design: "Bold" 
                }),
                new sap.m.Text({ text: v })
              ]
            }));
          });
          oSimpleForm.addContent(oHBox);
        }
      },
			
			_prepareDynamicTableData: function () {
            const oDetailModel = this.getModel("detailModel");
            const oRawContent = oDetailModel.getProperty("/rawJsonContent");
            const oTable = this.byId("dynamicTable");
            
            if (!oTable || !oRawContent) return;
            const aFlatData = mapper.flattenData(oRawContent);
            const aUniqueKeys = [...new Set(aFlatData.flatMap(Object.keys))];

            oTable.destroyColumns();
            aUniqueKeys.forEach(sKey => {
                const sLabelText = this.oBundle.hasText(sKey) 
                    ? this.oBundle.getText(sKey) 
                    : sKey.split("_").pop();

                oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Label({ text: sLabelText, tooltip: sKey }),
                    template: new sap.m.Text({ 
                        text: {
                            path: "detailModel>" + sKey,
                            formatter: formatter.formatJsonValue 
                        },
                        wrapping: false 
                    }),
                    sortProperty: sKey,
                    filterProperty: sKey,
                    width: "15rem"
                }));
            });

            oDetailModel.setProperty("/dynamicFlatData", aFlatData);
            oTable.bindRows("detailModel>/dynamicFlatData");
        },
			
			onViewSettOpen: function () {
				const oVSD = this.onOpenDialog(
					"settDialog",
					"integdashboard.view.fragments.viewSettingDialogLog",
					this
				);

				const aLog = this.getModel("detailModel")?.getProperty("/log") || [];
				const aFields = [
					{
						key: "AUFNR",
						label: this.oBundle.getText("network"),
					},
					{
						key: "VORNR",
						label: this.oBundle.getText("opNumb"),
					},
					{
						key: "AUTHMOD",
						label: this.oBundle.getText("autoreMod"),
					},
					{
						key: "MODDATE",
						label: this.oBundle.getText("dataMod"),
					},
					{
						key: "MODTIME",
						label: this.oBundle.getText("oraMod"),
					},
					{
						key: "MODOBJ",
						label: this.oBundle.getText("oggMod"),
					},
					{
						key: "OLDVAL",
						label: this.oBundle.getText("oldV"),
					},
					{
						key: "NEWVAL",
						label: this.oBundle.getText("newV"),
					},
					{
						key: "STATUS",
						label: this.oBundle.getText("status"),
					},
				];

				aFields.forEach((oField) => {
					const aValues = [
						...new Set(
							aLog
								.map((entry) => entry[oField.key])
								.filter(
									(val) => val !== undefined && val !== null && val !== ""
								)
						),
					];

					if (aValues.length > 0) {
						const oFilterItem = new sap.m.ViewSettingsFilterItem({
							key: oField.key,
							text: oField.label,
						});

						aValues.forEach((sVal) => {
							oFilterItem.addItem(
								new sap.m.ViewSettingsItem({
									key: sVal,
									text: sVal,
								})
							);
						});

						oVSD.addFilterItem(oFilterItem);
					}
				});

				oVSD.open();
			},
			handleConfirm: function (oEvent) {
				const oTable = this.byId("logTable");
				const mParams = oEvent.getParameters();
				const oSorter = mParams.sortItem
					? new sap.ui.model.Sorter(
							mParams.sortItem.getKey(),
							mParams.sortDescending
					  )
					: null;
				let oGroupSorter = null;
				if (mParams.groupItem) {
					oGroupSorter = new sap.ui.model.Sorter(
						mParams.groupItem.getKey(),
						mParams.groupDescending,
						true
					);
				}

				const aFilters = [];

				mParams.filterItems.forEach(function (oItem) {
					const sKey = oItem.getParent().getKey();
					const sValue = oItem.getKey();

					aFilters.push(
						new sap.ui.model.Filter(
							sKey,
							sap.ui.model.FilterOperator.EQ,
							sValue
						)
					);
				});

				const aSorters = [];
				if (oGroupSorter) aSorters.push(oGroupSorter);
				if (oSorter) aSorters.push(oSorter);

				oTable.getBinding("rows").filter(aFilters);
				oTable.getBinding("rows").sort(aSorters);
			},
		});
	}
);
