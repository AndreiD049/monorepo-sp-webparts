"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSDSTextField = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var react_hook_form_1 = require("react-hook-form");
var MSDSTextField_module_scss_1 = tslib_1.__importDefault(require("./MSDSTextField.module.scss"));
var MSDSTextField = function (props) {
    var _a;
    return (React.createElement("div", { title: props.title, className: MSDSTextField_module_scss_1.default.container, style: props.style },
        React.createElement(react_1.Label, { className: props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex', required: Boolean((_a = props.rules) === null || _a === void 0 ? void 0 : _a.required), htmlFor: props.id },
            props.icon || (React.createElement(react_1.Icon, { iconName: "TextField", style: { marginRight: '.3em' } })),
            ' ',
            React.createElement("span", null, props.label)),
        React.createElement(react_hook_form_1.Controller, { name: props.id, control: props.control, rules: props.rules, render: function (_a) {
                var _b;
                var field = _a.field, fieldState = _a.fieldState;
                return (React.createElement(react_1.TextField, tslib_1.__assign({ id: props.id }, props.fieldProps, { onChange: function (_ev, newValue) { return field.onChange(newValue); }, onBlur: field.onBlur, value: field.value, disabled: (_b = props.rules) === null || _b === void 0 ? void 0 : _b.disabled, componentRef: field.ref, errorMessage: fieldState.error && fieldState.error.message })));
            } })));
};
exports.MSDSTextField = MSDSTextField;
//# sourceMappingURL=index.js.map