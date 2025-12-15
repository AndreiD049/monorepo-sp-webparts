"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColors = useColors;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useColors() {
    var _a = React.useState([]), colors = _a[0], setColors = _a[1];
    var colorTags = React.useMemo(function () {
        return colors.map(function (color) { return ({
            name: color,
            key: color,
            data: color,
        }); });
    }, [colors]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = setColors;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getAllColors()];
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
        options: colors,
        set: setColors,
        tags: colorTags,
    };
}
//# sourceMappingURL=useColor.js.map