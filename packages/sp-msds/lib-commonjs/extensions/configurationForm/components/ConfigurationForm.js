"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var sp_core_library_1 = require("@microsoft/sp-core-library");
var ConfigurationForm_module_scss_1 = tslib_1.__importDefault(require("./ConfigurationForm.module.scss"));
var LOG_SOURCE = 'ConfigurationForm';
var ConfigurationForm = /** @class */ (function (_super) {
    tslib_1.__extends(ConfigurationForm, _super);
    function ConfigurationForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConfigurationForm.prototype.componentDidMount = function () {
        sp_core_library_1.Log.info(LOG_SOURCE, 'React Element: ConfigurationForm mounted');
    };
    ConfigurationForm.prototype.componentWillUnmount = function () {
        sp_core_library_1.Log.info(LOG_SOURCE, 'React Element: ConfigurationForm unmounted');
    };
    ConfigurationForm.prototype.render = function () {
        return React.createElement("div", { className: ConfigurationForm_module_scss_1.default.configurationForm });
    };
    return ConfigurationForm;
}(React.Component));
exports.default = ConfigurationForm;
//# sourceMappingURL=ConfigurationForm.js.map