"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextError = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var TextError_module_scss_1 = tslib_1.__importDefault(require("./TextError.module.scss"));
var TextError = function (props) {
    if (!props.error)
        return null;
    return React.createElement("div", { className: TextError_module_scss_1.default.container }, props.error);
};
exports.TextError = TextError;
//# sourceMappingURL=index.js.map