"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsdsTagPickerField = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var react_hook_form_1 = require("react-hook-form");
var TextError_1 = require("../TextError");
var MsdsTagPickerField_module_scss_1 = tslib_1.__importDefault(require("./MsdsTagPickerField.module.scss"));
var MsdsTagPickerField = function (props) {
    var _a;
    var handleFilter = React.useCallback(function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, props.handleFilter(filter.toLowerCase())];
        });
    }); }, [props.tags]);
    var getValue = props.getValue || (function (value) { return value.key; });
    return (React.createElement("div", { className: "".concat(MsdsTagPickerField_module_scss_1.default.container, " ").concat(props.className), title: props.title, style: props.style },
        React.createElement(react_1.Label, { className: props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex', required: Boolean((_a = props.rules) === null || _a === void 0 ? void 0 : _a.required), htmlFor: props.id },
            props.icon || (React.createElement(react_1.Icon, { iconName: "MultiSelect", style: { marginRight: '.3em' } })),
            ' ',
            React.createElement("span", null, props.label)),
        React.createElement(react_hook_form_1.Controller, { name: props.id, control: props.control, rules: props.rules, render: function (_a) {
                var _b;
                var field = _a.field, fieldState = _a.fieldState;
                var selected = React.useMemo(function () {
                    if (field.value) {
                        return props.tags
                            .filter(function (tag) { return getValue(tag) === field.value; })
                            .slice(0, 1);
                    }
                    return [];
                }, [field.value, props.tags]);
                return (React.createElement(React.Fragment, null,
                    React.createElement(react_1.TagPicker, { onEmptyResolveSuggestions: function () { return props.tags; }, onResolveSuggestions: function (filter, selected) {
                            return handleFilter(filter);
                        }, styles: {
                            text: {
                                backgroundColor: '#ffffff',
                                minWidth: 'auto',
                            },
                        }, ref: field.ref, itemLimit: 1, selectedItems: selected, onChange: function (selected) {
                            var value = selected && selected.length > 0
                                ? selected[0]
                                : null;
                            field.onChange(value ? getValue(value) : null);
                            if (props.handleSelect) {
                                props.handleSelect(value);
                            }
                            return selected;
                        }, disabled: (_b = props.rules) === null || _b === void 0 ? void 0 : _b.disabled }),
                    React.createElement(TextError_1.TextError, { error: (fieldState.error &&
                            fieldState.error.message) ||
                            '' })));
            } })));
};
exports.MsdsTagPickerField = MsdsTagPickerField;
//# sourceMappingURL=index.js.map