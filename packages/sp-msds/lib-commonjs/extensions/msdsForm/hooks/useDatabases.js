"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDatabases = useDatabases;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useDatabases(site) {
    var _a = React.useState([]), dbs = _a[0], setDbs = _a[1];
    var dbTags = React.useMemo(function () {
        return dbs.map(function (db) { return ({
            name: db,
            key: db,
            data: db,
        }); });
    }, [dbs]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(!site && dbs.length === 0)) return [3 /*break*/, 1];
                            setDbs([]);
                            return [3 /*break*/, 3];
                        case 1:
                            if (!site) return [3 /*break*/, 3];
                            _a = setDbs;
                            return [4 /*yield*/, lookup_service_1.LookupService.getDatabases(site)];
                        case 2:
                            _a.apply(void 0, [_b.sent()]);
                            _b.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        run().catch(function (err) { return console.error(err); });
    }, [site]);
    return {
        options: dbs,
        set: setDbs,
        tags: dbTags,
    };
}
//# sourceMappingURL=useDatabases.js.map