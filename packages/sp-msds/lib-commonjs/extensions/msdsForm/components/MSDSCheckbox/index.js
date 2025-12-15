"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSDSCheckbox = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var react_hook_form_1 = require("react-hook-form");
var MSDSCheckbox_module_scss_1 = tslib_1.__importDefault(require("./MSDSCheckbox.module.scss"));
var MSDSCheckbox = function (props) {
    var _a;
    return (React.createElement("div", { className: MSDSCheckbox_module_scss_1.default.container, title: props.title, style: props.style },
        React.createElement(react_1.Label, { className: props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex', required: Boolean((_a = props.rules) === null || _a === void 0 ? void 0 : _a.required), htmlFor: props.id },
            props.icon || (React.createElement(react_1.Icon, { iconName: "TaskManager", style: { marginRight: '.3em' } })),
            ' ',
            React.createElement("span", null, props.label)),
        React.createElement("div", { className: MSDSCheckbox_module_scss_1.default.checkboxRow },
            React.createElement(react_hook_form_1.Controller, { name: props.id, control: props.control, render: function (_a) {
                    var _b;
                    var field = _a.field, fieldState = _a.fieldState;
                    return (React.createElement(React.Fragment, null,
                        React.createElement(react_1.Checkbox, tslib_1.__assign({ id: props.id }, field, { checked: Boolean(field.value), disabled: (_b = props.rules) === null || _b === void 0 ? void 0 : _b.disabled, className: field.value ? MSDSCheckbox_module_scss_1.default.checkboxChecked : MSDSCheckbox_module_scss_1.default.checkboxUnhecked })),
                        React.createElement(react_1.Text, { variant: "medium" }, field.value ? ' - Yes' : ' - No')));
                } }))));
};
exports.MSDSCheckbox = MSDSCheckbox;
//# sourceMappingURL=index.js.map