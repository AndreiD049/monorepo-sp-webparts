"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupServiceCached = exports.LookupService = void 0;
var tslib_1 = require("tslib");
var sp_lodash_subset_1 = require("@microsoft/sp-lodash-subset");
var idb_proxy_1 = require("idb-proxy");
var constants_1 = require("../constants");
var LookupService = /** @class */ (function () {
    function LookupService() {
    }
    LookupService.InitService = function (sp, properties) {
        this.sp = sp;
        this.applicationList = this.sp.web.lists.getByTitle('Web application form');
        this.customerList = this.sp.web.lists.getByTitle('Customers');
        this.approversList = this.sp.web.lists.getByTitle(properties.approverListName);
    };
    LookupService.getCurrentUser = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.sp.web.currentUser()];
            });
        });
    };
    LookupService.getCustomer = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.customerList.items.getById(id).select('Id,Title,Name,Database')()];
            });
        });
    };
    LookupService.getAllCustomers = function (database_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function (database, top) {
            if (top === void 0) { top = 300; }
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.customerList.items.select('Id,Title,Name,Database').filter("Database eq '".concat(database, "'")).top(top)()];
            });
        });
    };
    LookupService.getCustomerFilter = function (filter, database) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.customerList.items
                        .select('Id,Title,Name,Database')
                        .filter("substringof('".concat(filter, "', Title) and Database eq '").concat(database, "'"))()];
            });
        });
    };
    LookupService.getAllDatabases = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var items;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.approversList.items.select('Database')()];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, (0, sp_lodash_subset_1.uniq)(items.map(function (i) { return i.Database; }))];
                }
            });
        });
    };
    LookupService.getDatabases = function (site) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dbs;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.approversList.items
                            .filter("Location eq '".concat(site, "'"))
                            .select('Id,Database')()];
                    case 1:
                        dbs = _a.sent();
                        return [2 /*return*/, (0, sp_lodash_subset_1.uniq)(dbs.map(function (i) { return i.Database; }))];
                }
            });
        });
    };
    LookupService.getAllSites = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.applicationList.fields.getByTitle('Site')()];
                    case 1: return [2 /*return*/, (_a = (_b.sent()).Choices) !== null && _a !== void 0 ? _a : []];
                }
            });
        });
    };
    LookupService.getAllFormShapes = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.applicationList.fields.getByTitle('Form or Shape')()];
                    case 1: return [2 /*return*/, (_a = (_b.sent())
                            .Choices) !== null && _a !== void 0 ? _a : []];
                }
            });
        });
    };
    LookupService.getAllColors = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.applicationList.fields.getByTitle('Color')()];
                    case 1: return [2 /*return*/, (_a = (_b.sent())
                            .Choices) !== null && _a !== void 0 ? _a : []];
                }
            });
        });
    };
    LookupService.getAllWarehouseTypes = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.applicationList.fields.getByTitle('Warehouse type')()];
                    case 1: return [2 /*return*/, (_a = (_b.sent()).Choices) !== null && _a !== void 0 ? _a : []];
                }
            });
        });
    };
    LookupService.getAllProductTypes = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.applicationList.fields.getByTitle('Product type')()];
                    case 1: return [2 /*return*/, (_a = (_b.sent())
                            .Choices) !== null && _a !== void 0 ? _a : []];
                }
            });
        });
    };
    LookupService.getAllHazardousGoodsCode = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.applicationList.fields.getByTitle('HAZARDOUS GOODS products code')()];
                    case 1: return [2 /*return*/, (_a = (_b.sent()).Choices) !== null && _a !== void 0 ? _a : []];
                }
            });
        });
    };
    LookupService.getApproversByLocation = function (site) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.approversList.items
                        .filter("Location eq '".concat(site, "'"))
                        .select('HSEQresponsable/Id,HSEQresponsable/Title,HSEQresponsable/EMail,Location')
                        .expand('HSEQresponsable')()];
            });
        });
    };
    LookupService.getSiteUsers = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.sp.web.siteUsers()];
            });
        });
    };
    return LookupService;
}());
exports.LookupService = LookupService;
exports.LookupServiceCached = (0, idb_proxy_1.createCacheProxy)(LookupService, {
    dbName: constants_1.DB_NAME,
    storeName: constants_1.STORE_NAME,
    prefix: 'LookupService',
    props: {
        'getSiteUsers|getCurrentUser|getAllCustomers|getCustomer|getAllDatabases|getAllSites|getAllFormShapes|getAllColors|getAllWarehouseTypes|getAllHazardousGoodsCode': {
            isCached: true,
            expiresIn: constants_1.HOUR,
            isPattern: true,
        },
    },
});
//# sourceMappingURL=lookup-service.js.map