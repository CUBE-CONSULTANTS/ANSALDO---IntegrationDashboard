/* eslint-disable no-debugger */
/* eslint-disable no- */
sap.ui.define(["../model/formatter"], function (formatter) {
	"use strict";
	return {
		getRootKeyByCode: function (sCode) {
			const typeByCode = {
				C001 : "Cost Center to TS",
				C002 : "WBE Master Data",
				C003 : "Network Master Data",
				C004 : "Production Order",
				C005 : "Activity Types Master Data",
				C006 : "Employee to TS",
				C007 : "Employee S/4",
				C008 : "Employee to ADP",
				C009 : "Cost Center to ADP",
				C010 : "Salary Accounting ADP to S4",
				C011 : "Tracking Activities",
				C012 : "primavera Eppm",
				C014 : "contractData",
				C015 : "Materials/ Creation Master",
				C016 : "Materials/ Bom",
				C020 : "massUpdateOfNetwork",
				C021 : "massUpdateOfProductionOrder",
				C022 : "Materials/ Classification",
				C023 : "Materials/ DMS",
				C024 : "TS/ Department",
				C025 : "Materials/ ECN Revision Level",
				C026 : "Expense In"
			};

			return typeByCode[sCode] || null;
		},
		getIntegrationSystems: function (code) {
			const integrationMap = {
				C001: {
					source: "SAP S/4 Hana",
					target: "Timesheet / Kiosk",
				},
				C002: {
					source: "SAP S/4 Hana",
					target: "Timesheet / Kiosk",
				},
				C003: {
					source: "SAP S/4 Hana",
					target: "Timesheet / Kiosk",
				},
				C004: {
					source: "SAP S/4 Hana",
					target: "Timesheet / Kiosk",
				},
				C005: {
					source: "SAP S/4 Hana",
					target: "Timesheet / Kiosk",
				},
				C006: {
					source: "SAP Success Factor",
					target: "Timesheet / Kiosk",
				},
				C007: {
					source: "SAP Success Factor",
					target: "SAP S/4 Hana",
				},
				C008: {
					source: "SAP Success Factor",
					target: "Oracle Primavera",
				},
				C009: {
					source: "SAP S/4 Hana",
					target: "Oracle Primavera",
				},
				C010: {
					source: "ADP",
					target: "SAP S/4 Hana",
				},
				C011: {
					source: "Timesheet / Kiosk",
					target: "SAP S/4 Hana",
				},
				C012: {
					source: "SAP S/4 Hana",
					target: "Oracle Primavera",
				},
				//C013: { source: "", target: "" },    "BPC Interface?"
				C014: {
					source: "SAP S/4 Hana",
					target: "Autodesk Vault",
				},
				C015: {
					source: "Autodesk Vault",
					target: "SAP S/4 Hana",
				},
				C016: {
					source: "Autodesk Vault",
					target: "SAP S/4 Hana",
				},
				// C017: {
				// 	source: "Expense In",
				// 	target: "SAP S/4 Hana",
				// },
				// C018: {
				// 	source: "SAP S/4 Hana",
				// 	target: "Timesheet / Kiosk",
				// },
				// C019: {
				// 	source: "Timesheet / Kiosk",
				// 	target: "SAP S/4 Hana",
				// },
				C020: {
					source: "Timesheet / Kiosk",
					target: "SAP S/4 Hana",
				},
				C021: {
					source: "Timesheet / Kiosk",
					target: "SAP S/4 Hana",
				},
				C022: {
					source: "Autodesk Vault",
					target: "SAP S/4 Hana",
				},
				C023: {
					source: "Autodesk Vault",
					target: "SAP S/4 Hana",
				},
				C024: {
					source: "SAP Success Factor",
					target: "Timesheet / Kiosk",
				},
				C025: {
					source: "Autodesk Vault",
					target: "SAP S/4 Hana",
				},
				C026: {
					source: "Expense In",
					target: "SAP S/4 Hana",
				},
			};
			const entry = integrationMap[code];
			return entry
				? { SysA: entry.source, SysB: entry.target }
				: { SysA: "", SysB: "" };
		},
		
		getKeyFieldsByCode: function (sCode, oRawContent) {
      if (!oRawContent) return [];
      const aFlat = this.flattenData(oRawContent);
      const oSample = aFlat[0] || {};
      return Object.keys(oSample).slice(0, 6);
    },
		flattenData: function (oData) {
      if (!oData) return [];
      let vTarget = oData;
      const aRootKeys = Object.keys(oData);
      if (aRootKeys.length === 1 && typeof oData[aRootKeys[0]] === "object") {
        vTarget = oData[aRootKeys[0]];
      }

      const aItems = Array.isArray(vTarget) ? vTarget : [vTarget];

      const fnFlattenRow = (oObj, sPrefix = "") => {
        const oFlatRow = {};
        for (const sKey in oObj) {
          if (!oObj.hasOwnProperty(sKey)) continue;

          const sPropName = sPrefix ? sPrefix + "_" + sKey : sKey;
          const vValue = oObj[sKey];

          if (vValue !== null && typeof vValue === "object") {
            if (Array.isArray(vValue)) {
              if (vValue.length > 0 && typeof vValue[0] === "object") {
                Object.assign(oFlatRow, fnFlattenRow(vValue[0], sPropName));
              } else {
                oFlatRow[sPropName] = vValue.join(", ");
              }
            } else {
              Object.assign(oFlatRow, fnFlattenRow(vValue, sPropName));
            }
          } else {
            oFlatRow[sPropName] = vValue;
          }
        }
        return oFlatRow;
      };

      return aItems.map((item) => fnFlattenRow(item));
    },
		// getColumnConfig: function (oDataSample, oBundle) {
		// 	if (!oDataSample) return [];

		// 	let aKeys = Object.keys(oDataSample).filter(
		// 		(k) => typeof oDataSample[k] !== "object"
		// 	);

		// 	Object.keys(oDataSample).forEach((k) => {
		// 		if (Array.isArray(oDataSample[k]) && oDataSample[k].length > 0) {
		// 			const aChildKeys = Object.keys(oDataSample[k][0]);
		// 			aChildKeys.forEach((ck) => {
		// 				if (!aKeys.includes(ck)) aKeys.push(ck);
		// 			});
		// 		}
		// 	});

		// 	return aKeys.map((sKey) => {
		// 		const sTitle = oBundle.hasText(sKey) ? oBundle.getText(sKey) : sKey;

		// 		return new sap.ui.table.Column({
		// 			label: new sap.m.Label({ text: sTitle }),
		// 			template: new sap.m.Text({
		// 				text: "{detailModel>" + sKey + "}",
		// 				wrapping: false,
		// 			}),
		// 			sortProperty: sKey,
		// 			filterProperty: sKey,
		// 			width: "12rem",
		// 		});
		// 	});
		// },



		// getColumnConfig2: function (oHeader, oBundle, oTable) {
		// 	if (!oHeader) return [];
		// 	let aKeys = Object.keys(oHeader).filter(
		// 		(k) => !Array.isArray(oHeader[k])
		// 	);

		// 	Object.keys(oHeader).forEach((k) => {
		// 		if (Array.isArray(oHeader[k]) && oHeader[k].length > 0) {
		// 			const childKeys = Object.keys(oHeader[k][0]);
		// 			aKeys = aKeys.concat(childKeys.filter((ck) => !aKeys.includes(ck)));
		// 		}
		// 	});

		// 	return aKeys.map(function (sKey, index) {
		// 		const sTitle = oBundle.hasText(sKey) ? oBundle.getText(sKey) : sKey;
		// 		const bIsLast = index === aKeys.length - 1;

		// 		const oColumn = new sap.ui.table.Column({
		// 			label: new sap.m.Label({ text: sTitle }),
		// 			template: new sap.m.Text({ text: `{detailModel>${sKey}}` }),
		// 			sortProperty: sKey,
		// 			filterProperty: sKey,
		// 			width: bIsLast ? undefined : "12rem",
		// 			autoResizable: bIsLast,
		// 		});

		// 		if (bIsLast) {
		// 			oColumn.setMinWidth(160);
		// 		}

		// 		return oColumn;
		// 	});
		// },

		// getColumnConfig: function (oHeader, oBundle) {
		// 	if (!oHeader) return [];

		// 	const aKeys = Object.keys(oHeader).filter((k) => k !== "positions");
		// 	return aKeys.map(function (sKey) {
		// 		const sTitle = oBundle.hasText(sKey) ? oBundle.getText(sKey) : sKey;

		// 		return new sap.ui.table.Column({
		// 			label: new sap.m.Label({ text: sTitle }),
		// 			template: new sap.m.Text({ text: `{detailModel>${sKey}}` }),
		// 			sortProperty: sKey,
		// 			filterProperty: sKey,
		// 			width: "12rem",
		// 		});
		// 	});
		// },
	};
});
