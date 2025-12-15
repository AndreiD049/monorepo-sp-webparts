"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var ReactDOM = tslib_1.__importStar(require("react-dom"));
var sp_core_library_1 = require("@microsoft/sp-core-library");
var sp_listview_extensibility_1 = require("@microsoft/sp-listview-extensibility");
var ConfigurationForm_1 = tslib_1.__importDefault(require("./components/ConfigurationForm"));
var LOG_SOURCE = 'ConfigurationFormFormCustomizer';
var ConfigurationFormFormCustomizer = /** @class */ (function (_super) {
    tslib_1.__extends(ConfigurationFormFormCustomizer, _super);
    function ConfigurationFormFormCustomizer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._onSave = function () {
            // You MUST call this.formSaved() after you save the form.
            _this.formSaved();
        };
        _this._onClose = function () {
            // You MUST call this.formClosed() after you close the form.
            _this.formClosed();
        };
        return _this;
    }
    ConfigurationFormFormCustomizer.prototype.onInit = function () {
        // Add your custom initialization to this method. The framework will wait
        // for the returned promise to resolve before rendering the form.
        sp_core_library_1.Log.info(LOG_SOURCE, 'Activated ConfigurationFormFormCustomizer with properties:');
        sp_core_library_1.Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
        return Promise.resolve();
    };
    ConfigurationFormFormCustomizer.prototype.render = function () {
        // Use this method to perform your custom rendering.
        var configurationForm = React.createElement(ConfigurationForm_1.default, {
            context: this.context,
            displayMode: this.displayMode,
            onSave: this._onSave,
            onClose: this._onClose
        });
        ReactDOM.render(configurationForm, this.domElement);
    };
    ConfigurationFormFormCustomizer.prototype.onDispose = function () {
        // This method should be used to free any resources that were allocated during rendering.
        ReactDOM.unmountComponentAtNode(this.domElement);
        _super.prototype.onDispose.call(this);
    };
    return ConfigurationFormFormCustomizer;
}(sp_listview_extensibility_1.BaseFormCustomizer));
exports.default = ConfigurationFormFormCustomizer;
//# sourceMappingURL=ConfigurationFormFormCustomizer.js.map