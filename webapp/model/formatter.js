/* eslint-disable no-debugger */
/* eslint-disable no-nested-ternary */
sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
	"use strict";

	return {
		formatValue: function (value) {
			return value && value.toUpperCase();
		},
		formatDate: function (sDate) {
			if (!sDate) return null;
			const oDateFormat = DateFormat.getInstance({ pattern: "dd/MM/yyyy" });
			const sFormattedDate = oDateFormat.format(
				new Date(sDate.substr(0, 4), sDate.substr(4, 2) - 1, sDate.substr(6, 2))
			);
			return sFormattedDate;
		},
		mergeDateAndTime: function (dateStr, timeStr) {
			if (!/^\d{8}$/.test(dateStr) || !/^\d{6}$/.test(timeStr)) return null;

			const year = parseInt(dateStr.slice(0, 4), 10);
			const month = parseInt(dateStr.slice(4, 6), 10) - 1;
			const day = parseInt(dateStr.slice(6, 8), 10);

			const hours = parseInt(timeStr.slice(0, 2), 10);
			const minutes = parseInt(timeStr.slice(2, 4), 10);
			const seconds = parseInt(timeStr.slice(4, 6), 10);

			return new Date(year, month, day, hours, minutes, seconds);
		},
		dateToBackendDate: function (oDate) {
			if (!(oDate instanceof Date)) return null;

			const y = oDate.getFullYear();
			const m = String(oDate.getMonth() + 1).padStart(2, "0");
			const d = String(oDate.getDate()).padStart(2, "0");

			return `${y}${m}${d}`; // YYYYMMDD
		},

		dateToBackendTime: function (oDate) {
			if (!(oDate instanceof Date)) return null;

			const h = String(oDate.getHours()).padStart(2, "0");
			const m = String(oDate.getMinutes()).padStart(2, "0");
			const s = String(oDate.getSeconds()).padStart(2, "0");

			return `${h}${m}${s}`; // HHmmss
		},
		formatDateTime: function (sDate) {
			if (!sDate) {
				return "";
			}
			const oDate = new Date(sDate);
			const twoDigits = function (n) {
				return n < 10 ? "0" + n : n;
			};

			const day = twoDigits(oDate.getDate());
			const month = twoDigits(oDate.getMonth() + 1);
			const year = oDate.getFullYear();

			const hours = twoDigits(oDate.getHours());
			const minutes = twoDigits(oDate.getMinutes());

			return day + "/" + month + "/" + year + " " + hours + ":" + minutes;
		},
		formatJsonDate: function (sValue) {
			if (typeof sValue === "string" && /^\d{8}$/.test(sValue)) {
				return (
					sValue.slice(6, 8) +
					"/" +
					sValue.slice(4, 6) +
					"/" +
					sValue.slice(0, 4)
				);
			}
			return sValue;
		},
		formatJsonTime: function (sValue) {
			if (typeof sValue === "string" && /^\d{6}$/.test(sValue)) {
				return (
					sValue.slice(0, 2) +
					":" +
					sValue.slice(2, 4) +
					":" +
					sValue.slice(4, 6)
				);
			}
			return sValue;
		},

		formatJsonValue: function (v) {
			if (Array.isArray(v)) {
				return v.length
					? typeof v[0] === "object"
						? JSON.stringify(v[0])
						: v.join(", ")
					: "";
			} else if (typeof v === "object" && v !== null) {
				return JSON.stringify(v);
			}
			return v;
		},
	};
});
