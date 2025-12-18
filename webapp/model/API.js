sap.ui.define(
	[],
	function () {
		"use strict";

		return {
			_normalizeResult(odata) {
				return Array.isArray(odata?.results) ? odata.results : [odata];
			},
			getEntitySet: function (
				oModel,
				Entity,
				{
					filters = [],
					expands = [],
					selects = [],
					orderby = "",
					search = "",
					params = {},
				} = {}
			) {
				const urlParameters = { ...params };
				if (expands.length) urlParameters.$expand = expands.join(",");
				if (selects.length) urlParameters.$select = selects.join(",");
				if (orderby) urlParameters.$orderby = orderby;
				if (search) urlParameters.$search = search;

				return new Promise((resolve, reject) => {
					oModel.read(Entity, {
						filters: filters.length ? filters : undefined,
						urlParameters: Object.keys(urlParameters).length
							? urlParameters
							: undefined,
						success: (odata) => {
							resolve({ results: this._normalizeResult(odata), success: true });
						},
						error: (err) => reject({ success: false, error: err }),
					});
				});
			},
			readByKey: function (
				oModel,
				Entity,
				keyValue,
				{ filters = [], expands = [], selects = [] } = {}
			) {
				const keyString =
					typeof keyValue === "object"
						? Object.entries(keyValue)
								.map(([k, v]) => `${k}='${v}'`)
								.join(",")
						: `'${keyValue}'`;

				let urlParameters = {};
				if (expands.length) urlParameters.$expand = expands.join(",");
				if (selects.length) urlParameters.$select = selects.join(",");

				return new Promise((resolve, reject) => {
					oModel.read(`${Entity}(${keyString})`, {
						filters: filters.length ? filters : undefined,
						urlParameters,
						success: (odata) =>
							resolve({ results: this._normalizeResult(odata), success: true }),
						error: (err) => reject({ success: false, error: err }),
					});
				});
			},
			readAll: function (
				oModel,
				Entity,
				{ top = 100, skip = 0, ...rest } = {}
			) {
				return this.getEntitySet(oModel, Entity, {
					...rest,
					params: { $top: top, $skip: skip, ...(rest.params || {}) },
				});
			},
			createEntity: function (oModel, Entity, oRecords, headers = {},Expands = []) {
        let urlParameters = {};
    
        if (Expands.length > 0) {
            urlParameters.$expand = Expands.join(",");
        }
        return new Promise((resolve, reject) => {
          oModel.create(Entity, oRecords, {
            headers: headers,
            urlParameters: Object.keys(urlParameters).length > 0 ? urlParameters : undefined,
            success: function (res) {
              resolve(res);
            },
            error: function (err) {
              reject({ success: false, error: err });
            },
          });
        });
      },
		};
	}
);
