"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductTypes = useProductTypes;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useProductTypes() {
    var _a = React.useState([]), productTypes = _a[0], setProductTypes = _a[1];
    var productTypeTags = React.useMemo(function () {
        return productTypes.map(function (ptype) { return ({
            name: ptype,
            key: ptype,
            data: ptype,
        }); });
    }, [productTypes]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = setProductTypes;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getAllProductTypes()];
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
        options: productTypes,
        set: setProductTypes,
        tags: productTypeTags,
    };
}
//# sourceMappingURL=useProductTypes.js.map