"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSDSSpinButton = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var react_hook_form_1 = require("react-hook-form");
var MSDSSpinButton_module_scss_1 = tslib_1.__importDefault(require("./MSDSSpinButton.module.scss"));
var STEP = 0.001;
var DIGITS = 3;
var MSDSSpinButton = function (props) {
    var _a;
    var handleValidate = React.useCallback(function (value) {
        var number = parseFloat(value);
        var result = '0';
        if (isNaN(number)) {
            result = '0';
        }
        else if (number < 0) {
            result = '0';
        }
        else if (number > 1) {
            result = '1';
        }
        else {
            result = number.toFixed(DIGITS);
        }
        return result;
    }, []);
    var handleButtons = React.useCallback(function (multiplier) { return function (value) {
        var numeric = +value;
        if (isNaN(numeric)) {
            return '0';
        }
        var result = numeric + STEP * multiplier;
        return handleValidate(result.toString());
    }; }, [handleValidate]);
    return (React.createElement("div", { title: props.title, className: MSDSSpinButton_module_scss_1.default.container, style: props.style },
        React.createElement(react_1.Label, { className: props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex', required: Boolean((_a = props.rules) === null || _a === void 0 ? void 0 : _a.required), htmlFor: props.id },
            props.icon || (React.createElement(react_1.Icon, { iconName: "TextField", style: { marginRight: '.3em' } })),
            ' ',
            React.createElement("span", null, props.label)),
        React.createElement(react_hook_form_1.Controller, { name: props.id, control: props.control, render: function (_a) {
                var _b;
                var field = _a.field, fieldState = _a.fieldState;
                return (React.createElement(react_1.SpinButton, { inputProps: tslib_1.__assign({}, field), defaultValue: "0", min: 0, max: 1, disabled: (_b = props.rules) === null || _b === void 0 ? void 0 : _b.disabled, step: STEP, onValidate: function (value) {
                        var result = handleValidate(value);
                        field.onChange(+result);
                    }, onIncrement: function (_value) {
                        var result = handleButtons(1)(field.value);
                        field.onChange(+result);
                    }, onDecrement: function (_value) {
                        var result = handleButtons(-1)(field.value);
                        field.onChange(+result);
                    }, value: field.value }));
            } })));
};
exports.MSDSSpinButton = MSDSSpinButton;
//# sourceMappingURL=index.js.map