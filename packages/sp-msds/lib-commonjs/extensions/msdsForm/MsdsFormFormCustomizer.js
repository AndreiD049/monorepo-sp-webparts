"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var ReactDOM = tslib_1.__importStar(require("react-dom"));
var sp_core_library_1 = require("@microsoft/sp-core-library");
var sp_listview_extensibility_1 = require("@microsoft/sp-listview-extensibility");
var sp_preset_1 = tslib_1.__importStar(require("sp-preset"));
var MsdsForm_1 = require("./components/MsdsForm");
var lookup_service_1 = require("./services/lookup-service");
var item_service_1 = require("./services/item-service");
require("./styles.scss");
var field_service_1 = require("./services/field-service");
var LOG_SOURCE = 'MsdsFormFormCustomizer';
var MsdsFormFormCustomizer = /** @class */ (function (_super) {
    tslib_1.__extends(MsdsFormFormCustomizer, _super);
    function MsdsFormFormCustomizer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Added for the item to show in the form; use with edit and view form
        _this._item = null;
        // Added for item's etag to ensure integrity of the update; used with edit form
        _this._etag = null;
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
    MsdsFormFormCustomizer.prototype.onInit = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Add your custom initialization to this method. The framework will wait
                        // for the returned promise to resolve before rendering the form.
                        sp_core_library_1.Log.info(LOG_SOURCE, 'Activated MsdsFormFormCustomizer with properties:');
                        sp_core_library_1.Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
                        MsdsFormFormCustomizer.SPBuilder = new sp_preset_1.default(this.context)
                            .withRPM(600)
                            .withAdditionalTimelines([
                            (0, sp_preset_1.InjectHeaders)({
                                UserAgent: "NONISV|Katoen Natie|MSDS/1.0",
                            }),
                        ]);
                        lookup_service_1.LookupService.InitService(MsdsFormFormCustomizer.SPBuilder.getSP(), this.properties);
                        item_service_1.ItemService.InitService(MsdsFormFormCustomizer.SPBuilder.getSP());
                        field_service_1.FieldService.InitService(MsdsFormFormCustomizer.SPBuilder.getSP());
                        if (!(this.displayMode !== sp_core_library_1.FormDisplayMode.New)) return [3 /*break*/, 2];
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this._etag = JSON.parse(this.context.item['@odata.etag']);
                        this._item = this.context.item;
                        // Import the comment section chunk only if it's Edit or Display mode
                        return [4 /*yield*/, Promise.resolve().then(function () { return tslib_1.__importStar(require(
                            /* webpackChunkName: 'CommentSection' */
                            './components/CommentSection')); }).then(function (module) {
                                _this.properties.CommentSection = module.CommentSection;
                            })];
                    case 1:
                        // Import the comment section chunk only if it's Edit or Display mode
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    MsdsFormFormCustomizer.prototype.render = function () {
        // Use this method to perform your custom rendering.
        var msdsForm = React.createElement(MsdsForm_1.MsdsForm, {
            context: this.context,
            displayMode: this.displayMode,
            onSave: this._onSave,
            onClose: this._onClose,
            item: this._item,
            etag: this._etag,
            CommentSection: this.properties.CommentSection
        });
        ReactDOM.render(msdsForm, this.domElement);
    };
    MsdsFormFormCustomizer.prototype.onDispose = function () {
        // This method should be used to free any resources that were allocated during rendering.
        ReactDOM.unmountComponentAtNode(this.domElement);
        _super.prototype.onDispose.call(this);
    };
    MsdsFormFormCustomizer.SPBuilder = null;
    return MsdsFormFormCustomizer;
}(sp_listview_extensibility_1.BaseFormCustomizer));
exports.default = MsdsFormFormCustomizer;
//# sourceMappingURL=MsdsFormFormCustomizer.js.map