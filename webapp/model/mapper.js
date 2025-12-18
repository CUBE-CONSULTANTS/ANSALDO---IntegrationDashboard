/* eslint-disable no-debugger */
/* eslint-disable no- */
sap.ui.define(["../model/formatter"], function (formatter) {
	"use strict";
	return {
		getRootKeyByCode: function (sCode) {
			debugger
			const typeByCode = {
				C001: "CostCenterTS",
				C002: "wbeMd",
				C003: "netMd",
				C004: "prdoOMD",
				C005: "atmd",
				C006: "ets",
				C007: "es4",
				C008: "eadp",
				C009: "CostCenterADP",
				C010: "salAcc",
				C011: "trackAct",
				C012: "primaveraEppm",
				C013: "bpcInterface",
				C014: "contractData",
				C015: "vaultMaterials",
				C016: "vaultBoms",
				C017: "expenseIn",
				C018: "productionOrders",
				C019: "massUpdateOfNetwork",
				C020: "massUpdateOfProductionOrder",
				C021: "dms",
				
				// C001: "Cost Center TS",
				// C002: "WBE",
				// C003: "Network",
				// C004: "Production Order",
				// C005: "Activity Types",
				// C006: "Employee TS",
				// C007: "Employee S/4",
				// C008: "Employee ADP",
				// C009: "CostCenter ADP",
				// C010: "Salary Accounting",
				// C011: "Tracking Activities",
				// C012: "primaveraEppm",
				// C013: "bpcInterface",
				// C014: "contractData",
				// C015: "vaultMaterials",
				// C016: "vaultBoms",
				// C017: "costCenterMaster",
				// C018: "productionOrders", ???
				// C019: "salaryAccounting" ???
				// C020: "massUpdateOfNetwork",
				// C021: "massUpdateOfProductionOrder",
				// C022: "VaultMaterialsClassification",
				// C023: "Department TS",
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
					source: "SAP SuccessFactor",
					target: "Timesheet / Kiosk",
				},
				C007: {
					source: "SAP SuccessFactor",
					target: "SAP S/4 Hana",
				},
				C008: {
					source: "SAP SuccessFactor",
					target: "ADP",
				},
				C009: {
					source: "SAP S/4 Hana",
					target: "ADP",
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
				C013: { source: "", target: ""}, 	//   "BPC Interface"
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
				C017: {
					source: "Expense In",
					target: "SAP S/4 Hana",
				},
				C018: {
					source: "SAP S/4 Hana",
					target: "Timesheet / Kiosk",
				},
				C019: {
					source: "Timesheet / Kiosk",
					target: "SAP S/4 Hana",
				},
				C020: {
					source: "Timesheet / Kiosk",
					target: "SAP S/4 Hana",
				},
				C021: {
					source: "Autodesk Vault",
					target: "SAP S/4 Hana",
				},

			};
			const entry = integrationMap[code];
			return entry
				? { SysA: entry.source, SysB: entry.target }
				: { SysA: "", SysB: ""};
		},
		//se senza chiavi di riconoscimento integration:
		identifyIntegration: function (jsonContent) {
			const fieldMapping = {
				activityTypes: ["LSTAR", "KTEXT", "DATBI", "DATAB", "OPERA"],
				employeesS4: [
					"USRID",
					"HIRE_DATE",
					"BUKRS",
					"WERKS",
					"KOSTL",
					"PERSG",
					"PERSK",
					"BTRTL",
					"ANRED",
					"VORNA",
					"NACHN",
					"GBDAT",
					"GBORT",
					"NATIO",
					"GESCH",
					"SPRSL",
					"USRID",
					"USRID",
					"USRID",
					"LSTAR",
					"ICNUM",
				],
				employeesTS: [
					"person-id-external",
					"first-name",
					"last-name",
					"title",
					"date-of-birth",
					"gender",
					"status",
					"email-address",
					"companyEntryDate",
					"manager-ID",
					"hireDate",
					"terminationDate",
					"employment-type",
					"is-fulltime-employee",
					"employee-class",
					"overtime-payed",
					"fte",
					"department",
					"legal-entity",
					"Phone Number",
					"location",
					"cost-center",
					"standard-hours",
					"job-code",
					"OPERA",
				],
				costCentersADP: ["code", "name", "DATBI", "DATAB", "inactiveIndicator"],
				orderHeaders: ["AUFNR", "KTEXT", "PSPNR", "GSTRP", "GLTRP", "OPERA"],
				network: [
					"AUFNR",
					"VORNR",
					"LTXA1",
					"NTANF",
					"NTEND",
					"VSTTXT",
					"OPERA",
				],
				wbeElements: [
					"PSPNR",
					"POSID",
					"POST1",
					"PSTRT",
					"PENDE",
					"STTXT_EXT",
					"OPERA",
				],
				costCenters: ["KOSTL", "BUKRS", "LTEXT", "DATBI", "DATAB", "OPERA"],
				businessPartners: ["BP_ID", "NAME", "ADDRESS", "PHONE", "EMAIL"],
				dms: ["DOCUMENT_ID", "FILE_NAME", "CREATED_DATE", "MODIFIED_DATE"],
				expenseIn: ["EXPENSE_ID", "AMOUNT", "CATEGORY", "DATE"],
				primaveraEppm: [
					"PROJECT_ID",
					"PHASE",
					"TASK",
					"START_DATE",
					"END_DATE",
				],
				bpcInterface: ["INTERFACE_ID", "STATUS", "DATA", "TYPE"],
				contractData: ["CONTRACT_ID", "PARTNER_ID", "START_DATE", "END_DATE"],
				vaultBoms: ["BOM_ID", "ITEM", "QUANTITY", "DESCRIPTION"],
				vaultMaterials: ["MATERIAL_ID", "NAME", "QUANTITY", "UNIT"],
				costCenterMaster: ["KOSTL", "NAME", "DATBI", "DATAB", "OPERA"],
				wbeMaster: ["PSPNR", "NAME", "DESCRIPTION", "STATUS"],
				networkMaster: ["AUFNR", "NAME", "STATUS", "DESCRIPTION"],
				productionOrders: [
					"AUFNR",
					"KTEXT",
					"AUART",
					"STTXT",
					"WERKS",
					"PLNBEZ",
					"GAMNG",
					"GWEMG",
					"GSTRP",
					"GLTRP",
					"OPERA",
				],
				salaryAccounting: [
					"PAYRUN",
					"COMPANY",
					"PAYGROUP",
					"COSTCENTREDESC",
					"SECTION",
					"DESCRIPTION",
					"AMOUNT",
					"PAYPERIODEND",
					"PAYCHECKDATE",
					"TAXPERIOD",
					"TAXYEAR",
				],
				trackingActivitiesImport: [
					"ID-TRACK",
					"PERSON-ID",
					"ACDTE",
					"PSPNR",
					"HH-WBE",
					"AUFNR",
					"VORNR",
					"HH-NETWORK",
					"AUFNR",
					"VORNR",
					"HH-LABOUR",
					"HH-SET-UP",
					"HH-MACHINE",
					"PERC",
					"OPERA",
				],
				trackingActivitiesExport: ["STATUS", "NR-DOCUMENT", "MSG_TEXT"],
				trackingCancellationImport: ["NR-DOCUMENT"],
				trackingCancellationExport: ["STATUS", "MSG_TEXT"],
				massiveReversalImport: [
					"ID-TRACK",
					"PERSON-ID",
					"ACDTE",
					"AUFNR_SEND",
					"VORNR_SEND",
					"HH-NETWORK",
					"AUFNR_TARG",
					"VORNR_TARG",
					"AUFNR_SEND",
					"VORNR_SEND",
					"HH-LABOUR",
					"HH-SET-UP",
					"HH-MACHINE",
					"PERC",
					"AUFNR_TARG",
					"VORNR_TARG",
					"TEXT",
				],
				massiveReversalExport: ["STATUS", "NR-DOCUMENT", "MSG_TEXT"],
			};
			for (const [integrationType, fields] of Object.entries(fieldMapping)) {
				const isMatching = fields.every((field) => field in jsonContent);
				if (isMatching) {
					return integrationType;
				}
			}
			return "Unknown";
		},

		getKeyFieldsByCode: function (sCode) {
			const mappingByCode = {
				C001: ["KOSTL", "KTEXT", "BUKRS"], // Cost Center TS
				C002: ["PSPNR", "POSID", "POST1"], // WBE
				C003: ["AUFNR", "KTEXT"], // Network
				C004: ["AUFNR", "KTEXT", "AUART", "WERKS", "PLNBEZ"], // Production Order
				C005: ["LSTAR", "KTEXT"], // Activity Types
				C006: [
					"USRID",
					"VORNA",
					"NACHN",
					"EMAIL",
					"HIRE_DATE",
					"BUKRS",
					"WERKS",
					"KOSTL",
					"PERSG",
					"PERSK",
				], // Employee TS
				C007: [
					"USRID",
					"VORNA",
					"NACHN",
					"EMAIL",
					"HIRE_DATE",
					"BUKRS",
					"WERKS",
					"KOSTL",
					"PERSG",
					"PERSK",
				], // Employee S/4
				C008: ["PSPNR", "POSID", "POST1"], // Some other integration
				C009: ["KOSTL", "BUKRS", "LTEXT"], // Cost Center ADP
				C010: ["AUFNR", "KTEXT"], // Salary Accounting
				C011: [
					"USRID",
					"VORNA",
					"NACHN",
					"EMAIL",
					"HIRE_DATE",
					"BUKRS",
					"WERKS",
					"KOSTL",
					"PERSG",
					"PERSK",
				], // Tracking Activities
				C012: ["PROJECT_ID", "PHASE", "TASK", "START_DATE", "END_DATE"], // primaveraEppm
				C013: ["INTERFACE_ID", "STATUS", "DATA", "TYPE"], // bpcInterface
				C014: ["CONTRACT_ID", "PARTNER_ID", "START_DATE", "END_DATE"], // contractData
				C015: [
					"Product",
					"ProductType",
					"GrossWeight",
					"NetWeight",
					"CountryOfOrigin",
					"Division",
				], // vaultBoms
				C016: ["MATERIAL_ID", "NAME", "QUANTITY", "UNIT"], // vaultMaterials
				C017: ["KOSTL", "NAME", "DATBI", "DATAB", "OPERA"], // costCenterMaster
				C018: [
					"AUFNR",
					"KTEXT",
					"AUART",
					"WERKS",
					"PLNBEZ",
					"GAMNG",
					"GWEMG",
					"GSTRP",
					"GLTRP",
					"OPERA",
				], // productionOrders
				C019: [
					"PAYRUN",
					"COMPANY",
					"PAYGROUP",
					"COSTCENTREDESC",
					"SECTION",
					"DESCRIPTION",
					"AMOUNT",
					"PAYPERIODEND",
					"PAYCHECKDATE",
					"TAXPERIOD",
					"TAXYEAR",
				], // salaryAccounting
				C020: ["AUFNR", "VORNR", "LTXA1", "NTANF", "NTEND", "VSTTXT", "OPERA"], // massUpdateOfNetwork
				C021: ["AUFNR", "VORNR", "LTXA1", "NTANF", "NTEND", "VSTTXT", "OPERA"], // massUpdateOfProductionOrder
			};

			return mappingByCode[sCode] || [];
		},
		getColumnConfig: function (oHeader, oBundle, oTable) {
			if (!oHeader) return [];
			let aKeys = Object.keys(oHeader).filter(
				(k) => !Array.isArray(oHeader[k])
			);

			Object.keys(oHeader).forEach((k) => {
				if (Array.isArray(oHeader[k]) && oHeader[k].length > 0) {
					const childKeys = Object.keys(oHeader[k][0]);
					aKeys = aKeys.concat(childKeys.filter((ck) => !aKeys.includes(ck)));
				}
			});

			return aKeys.map(function (sKey, index) {
				const sTitle = oBundle.hasText(sKey) ? oBundle.getText(sKey) : sKey;
				const bIsLast = index === aKeys.length - 1;

				const oColumn = new sap.ui.table.Column({
					label: new sap.m.Label({ text: sTitle }),
					template: new sap.m.Text({ text: `{detailModel>${sKey}}` }),
					sortProperty: sKey,
					filterProperty: sKey,
					width: bIsLast ? undefined : "12rem",
					autoResizable: bIsLast,
				});

				if (bIsLast) {
					oColumn.setMinWidth(160);
				}

				return oColumn;
			});
		},

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
