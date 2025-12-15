"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buttons = void 0;
var tslib_1 = require("tslib");
var sp_core_library_1 = require("@microsoft/sp-core-library");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var Buttons_module_scss_1 = tslib_1.__importDefault(require("./Buttons.module.scss"));
var Buttons = function (props) {
    var buttons = React.useMemo(function () {
        var buttons = [];
        if (props.displayMode === sp_core_library_1.FormDisplayMode.New) {
            buttons.push(React.createElement(react_1.PrimaryButton, { type: "submit" }, "Create"));
        }
        else {
            buttons.push(React.createElement(react_1.PrimaryButton, { type: "submit" }, "Save"));
        }
        buttons.push(React.createElement(react_1.DefaultButton, { onClick: function () { return props.onClose(); } }, "Close"));
        return buttons;
    }, [props.displayMode]);
    return (React.createElement("div", { className: "".concat(Buttons_module_scss_1.default.msdsFormButtons, " ").concat(props.className) }, buttons));
};
exports.Buttons = Buttons;
//# sourceMappingURL=index.js.map