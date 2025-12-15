"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsdsAttachmentsDetails = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var sp_components_1 = require("sp-components");
var constants_1 = require("../../constants");
var useAttachments_1 = require("../../hooks/useAttachments");
var item_service_1 = require("../../services/item-service");
var MsdsAttachmentsDetails_module_scss_1 = tslib_1.__importDefault(require("./MsdsAttachmentsDetails.module.scss"));
var AttachmentPill = function (props) {
    var handleView = React.useCallback(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = window).open;
                    return [4 /*yield*/, item_service_1.ItemService.getAttachmentUrl(props.attachment.ServerRelativePath.DecodedUrl)];
                case 1:
                    _b.apply(_a, [_c.sent(), '_blank',
                        'noreferrer,noopener']);
                    return [2 /*return*/];
            }
        });
    }); }, [props.attachment]);
    var handleDelete = React.useCallback(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            (0, sp_components_1.showDialog)({
                id: constants_1.DIALOG_ID,
                dialogProps: {
                    dialogContentProps: {
                        title: 'Delete attachment',
                        subText: 'Attachment will be permanently deleted. Are you sure?',
                    },
                },
                footer: (React.createElement(sp_components_1.FooterYesNo, { onNo: function () { return (0, sp_components_1.hideDialog)(constants_1.DIALOG_ID); }, onYes: function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    (0, sp_components_1.hideDialog)(constants_1.DIALOG_ID);
                                    return [4 /*yield*/, item_service_1.ItemService.deleteAttachment(props.attachment.ServerRelativePath.DecodedUrl)];
                                case 1:
                                    _a.sent();
                                    (0, useAttachments_1.reloadAttachments)();
                                    return [2 /*return*/];
                            }
                        });
                    }); } })),
            });
            return [2 /*return*/];
        });
    }); }, [props.attachment]);
    return (React.createElement("div", { tabIndex: 0, className: "".concat(MsdsAttachmentsDetails_module_scss_1.default.attachmentPill, " ").concat(MsdsAttachmentsDetails_module_scss_1.default.attachment) },
        React.createElement(react_1.Text, { title: props.attachment.FileName, className: MsdsAttachmentsDetails_module_scss_1.default.attachmentText, variant: "medium" }, props.attachment.FileName),
        React.createElement(react_1.IconButton, { className: MsdsAttachmentsDetails_module_scss_1.default.attachmentIcon, iconProps: { iconName: 'View' }, onClick: handleView }),
        React.createElement(react_1.IconButton, { className: MsdsAttachmentsDetails_module_scss_1.default.attachmentIcon, iconProps: { iconName: 'Delete' }, onClick: handleDelete })));
};
var MsdsAttachmentsDetails = function (props) {
    var _a;
    var input = React.useRef(null);
    var hasAttachments = ((_a = props.attachments) === null || _a === void 0 ? void 0 : _a.length) > 0;
    var handleAddAttachment = React.useCallback(function (file) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (file === null) {
                        return [2 /*return*/];
                    }
                    (0, sp_components_1.showSpinner)(constants_1.SPINNER_ID);
                    return [4 /*yield*/, item_service_1.ItemService.addAttachment(props.itemId, file)];
                case 1:
                    _a.sent();
                    (0, useAttachments_1.reloadAttachments)();
                    (0, sp_components_1.hideSpinner)(constants_1.SPINNER_ID);
                    return [2 /*return*/];
            }
        });
    }); }, [props.itemId]);
    return (React.createElement("div", { className: MsdsAttachmentsDetails_module_scss_1.default.container },
        React.createElement(react_1.Label, { htmlFor: props.id, required: props.required, title: props.title },
            React.createElement(react_1.Icon, { iconName: "TextField", style: { marginRight: '.3em' } }),
            ' ',
            React.createElement("span", null, props.label)),
        React.createElement("input", { id: props.id, type: "file", ref: input, onChange: function (ev) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, handleAddAttachment(ev.target.files && ev.target.files[0])];
            }); }); } }),
        React.createElement(react_1.PrimaryButton, { iconProps: { iconName: 'Attach' }, onClick: function () { return input.current && input.current.click(); } }, "Add attachments"),
        hasAttachments && (React.createElement(React.Fragment, null,
            React.createElement(react_1.Separator, null),
            props.attachments.map(function (att) { return (React.createElement(AttachmentPill, { key: att.ServerRelativeUrl, attachment: att })); })))));
};
exports.MsdsAttachmentsDetails = MsdsAttachmentsDetails;
//# sourceMappingURL=index.js.map