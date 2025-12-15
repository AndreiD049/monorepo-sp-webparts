"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldServiceCached = exports.FieldService = void 0;
var tslib_1 = require("tslib");
var idb_proxy_1 = require("idb-proxy");
var constants_1 = require("../constants");
var FieldService = /** @class */ (function () {
    function FieldService() {
    }
    FieldService.InitService = function (sp) {
        this.sp = sp;
        this.fieldList = this.sp.web.lists.getByTitle("Application form fields");
    };
    FieldService.getFields = function (site) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.fieldList.items.filter("Site eq '".concat(site, "'"))()];
            });
        });
    };
    return FieldService;
}());
exports.FieldService = FieldService;
exports.FieldServiceCached = (0, idb_proxy_1.createCacheProxy)(FieldService, {
    dbName: constants_1.DB_NAME,
    storeName: constants_1.STORE_NAME,
    prefix: 'FieldService',
    props: {
        'getFields': {
            isCached: true,
            expiresIn: constants_1.HOUR * 8,
            isPattern: true,
        },
    }
});
//# sourceMappingURL=field-service.js.map