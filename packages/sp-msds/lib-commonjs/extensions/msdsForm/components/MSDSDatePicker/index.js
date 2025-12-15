"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSDSDatePicker = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var react_hook_form_1 = require("react-hook-form");
var utils_1 = require("../../utils");
var TextError_1 = require("../TextError");
var MSDSDatePicker = function (props) {
    var _a;
    return (React.createElement("div", { title: props.title, style: props.style },
        React.createElement(react_1.Label, { className: props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex', required: Boolean((_a = props.rules) === null || _a === void 0 ? void 0 : _a.required), htmlFor: props.id },
            props.icon || (React.createElement(react_1.Icon, { iconName: "Calendar", style: { marginRight: '.3em' } })),
            ' ',
            React.createElement("span", null, props.label)),
        React.createElement(react_hook_form_1.Controller, { name: props.id, control: props.control, rules: props.rules, render: function (_a) {
                var _b;
                var field = _a.field, fieldState = _a.fieldState;
                return (React.createElement(React.Fragment, null,
                    React.createElement(react_1.DatePicker, tslib_1.__assign({}, props.pickerProps, { id: props.id, value: field.value ? new Date(field.value) : undefined, formatDate: function (date) { var _a; return (_a = date === null || date === void 0 ? void 0 : date.toLocaleDateString()) !== null && _a !== void 0 ? _a : ""; }, onSelectDate: function (date) {
                            if (date === null || date === undefined) {
                                return "";
                            }
                            return field.onChange((0, utils_1.formatDate)(date));
                        }, disabled: (_b = props.rules) === null || _b === void 0 ? void 0 : _b.disabled })),
                    React.createElement(TextError_1.TextError, { error: fieldState.error && fieldState.error.message || "" })));
            } })));
};
exports.MSDSDatePicker = MSDSDatePicker;
//# sourceMappingURL=index.js.map