"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collapsible = void 0;
exports.handleToggle = handleToggle;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var Collapsible_module_scss_1 = tslib_1.__importDefault(require("./Collapsible.module.scss"));
function handleToggle(field, setState) {
    setState(function (prev) {
        var _a;
        return (tslib_1.__assign(tslib_1.__assign({}, prev), (_a = {}, _a[field] = !prev[field], _a)));
    });
}
var More = function (props) {
    return React.createElement("div", { className: Collapsible_module_scss_1.default.more, role: "button", onClick: props.onClick }, "Unhide...");
};
var Collapsible = function (props) {
    return (React.createElement("div", { className: Collapsible_module_scss_1.default.container },
        React.createElement(react_1.Text, { className: Collapsible_module_scss_1.default.headerText, block: true, variant: "xLargePlus", onClick: props.onToggle },
            React.createElement("span", null, props.headerText),
            React.createElement(react_1.Icon, { className: Collapsible_module_scss_1.default.headerCollapseIcon, iconName: props.isOpen ? 'ChevronDown' : 'ChevronRight' })),
        props.isOpen ? props.children : React.createElement(More, { onClick: props.onToggle })));
};
exports.Collapsible = Collapsible;
//# sourceMappingURL=index.js.map