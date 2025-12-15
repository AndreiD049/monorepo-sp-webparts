"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCustomers = useCustomers;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useCustomers(database, selectedId) {
    var _a = React.useState([]), customers = _a[0], setCustomers = _a[1];
    var customerTags = React.useMemo(function () {
        return customers.map(function (c) { return ({
            name: c.Title,
            key: c.Id,
            data: c,
        }); });
    }, [customers]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var first, _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!database) {
                                setCustomers([]);
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getAllCustomers(database)];
                        case 1:
                            first = _c.sent();
                            if (!selectedId) return [3 /*break*/, 3];
                            _b = (_a = first).push;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getCustomer(selectedId)];
                        case 2:
                            _b.apply(_a, [_c.sent()]);
                            _c.label = 3;
                        case 3:
                            setCustomers(first);
                            return [2 /*return*/];
                    }
                });
            });
        }
        run().catch(function (err) { return console.error(err); });
    }, [database]);
    return {
        options: customers,
        set: setCustomers,
        tags: customerTags,
    };
}
//# sourceMappingURL=useCustomers.js.map