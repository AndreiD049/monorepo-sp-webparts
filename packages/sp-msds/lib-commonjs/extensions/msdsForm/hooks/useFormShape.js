"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFormShape = useFormShape;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useFormShape() {
    var _a = React.useState([]), formShape = _a[0], setFormShape = _a[1];
    var formShapeTags = React.useMemo(function () {
        return formShape.map(function (form) { return ({
            name: form,
            key: form,
            data: form,
        }); });
    }, [formShape]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = setFormShape;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getAllFormShapes()];
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
        options: formShape,
        set: setFormShape,
        tags: formShapeTags,
    };
}
//# sourceMappingURL=useFormShape.js.map