"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMaterialTypes = useMaterialTypes;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
function useMaterialTypes() {
    var _a = React.useState(["Finished goods", "Raw material", "Packaging material"]), types = _a[0], setTypes = _a[1];
    return {
        options: types,
        set: setTypes,
        tags: types.map(function (t) { return ({
            name: t,
            key: t,
            data: t,
        }); }),
    };
}
//# sourceMappingURL=useMaterialTypes.js.map