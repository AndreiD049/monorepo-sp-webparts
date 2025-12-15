"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWarehouseTypes = useWarehouseTypes;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useWarehouseTypes() {
    var _a = React.useState([]), whtypes = _a[0], setWhTypes = _a[1];
    var whTypeTags = React.useMemo(function () {
        return whtypes.map(function (whtype) { return ({
            name: whtype,
            key: whtype,
            data: whtype,
        }); });
    }, [whtypes]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = setWhTypes;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getAllWarehouseTypes()];
                        case 1:
                            _a.apply(void 0, [_b.sent()]);
                            return [2 /*return*/];
                    }
                });
            });
        }
        run().catch(function (err) { return console.error(err); });
    }, []);
    return {
        options: whtypes,
        set: setWhTypes,
        tags: whTypeTags,
    };
}
//# sourceMappingURL=useWarehouseType.js.map