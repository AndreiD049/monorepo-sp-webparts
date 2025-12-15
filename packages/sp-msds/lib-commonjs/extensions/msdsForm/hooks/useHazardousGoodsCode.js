"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHazardousGoodsCodes = useHazardousGoodsCodes;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useHazardousGoodsCodes() {
    var _a = React.useState([]), codes = _a[0], setCodes = _a[1];
    var codeTags = React.useMemo(function () {
        return codes.map(function (code) { return ({
            name: code,
            key: code,
            data: code,
        }); });
    }, [codes]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = setCodes;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getAllHazardousGoodsCode()];
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
        options: codes,
        set: setCodes,
        tags: codeTags,
    };
}
//# sourceMappingURL=useHazardousGoodsCode.js.map