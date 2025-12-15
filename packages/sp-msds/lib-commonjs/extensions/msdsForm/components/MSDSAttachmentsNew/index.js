"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSDSAttachmentsNew = void 0;
exports.mergeFiles = mergeFiles;
exports.removeFile = removeFile;
var tslib_1 = require("tslib");
var sp_lodash_subset_1 = require("@microsoft/sp-lodash-subset");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var react_hook_form_1 = require("react-hook-form");
var TextError_1 = require("../TextError");
var MSDSAttachmentsNew_module_scss_1 = tslib_1.__importDefault(require("./MSDSAttachmentsNew.module.scss"));
function mergeFiles(files1, files2) {
    if (!files1)
        return files2;
    if (!files2)
        return files1;
    return (0, sp_lodash_subset_1.uniqBy)(tslib_1.__spreadArray(tslib_1.__spreadArray([], files1, true), files2, true), function (f) { return f.name; });
}
function removeFile(files, fileToRemove) {
    if (!files)
        return [];
    return files.filter(function (f) { return f.name !== fileToRemove; });
}
var MSDSAttachmentsNew = function (props) {
    var _a;
    var input = React.useRef(null);
    return (React.createElement("div", { className: MSDSAttachmentsNew_module_scss_1.default.container },
        React.createElement(react_1.Label, { htmlFor: props.id, required: Boolean((_a = props.rules) === null || _a === void 0 ? void 0 : _a.required), title: props.title },
            React.createElement(react_1.Icon, { iconName: "TextField", style: { marginRight: '.3em' } }),
            ' ',
            React.createElement("span", null, props.label)),
        React.createElement(react_hook_form_1.Controller, { name: props.id, control: props.control, rules: props.rules, render: function (_a) {
                var _b, _c;
                var field = _a.field, fieldState = _a.fieldState;
                return (React.createElement(React.Fragment, null,
                    React.createElement("input", { id: props.id, type: "file", multiple: true, ref: input, value: '', onChange: function (ev) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                            var files;
                            return tslib_1.__generator(this, function (_a) {
                                files = Array.from(ev.target.files || []);
                                field.onChange(mergeFiles(field.value, files));
                                return [2 /*return*/];
                            });
                        }); } }),
                    React.createElement(react_1.Stack, { verticalAlign: "start", horizontalAlign: "start", tokens: { childrenGap: '.3em' } },
                        React.createElement(react_1.PrimaryButton, { iconProps: { iconName: 'Attach' }, onClick: function () { return input.current && input.current.click(); } }, "Add attachments"),
                        ((_b = field.value) === null || _b === void 0 ? void 0 : _b.length) && (React.createElement("div", { className: MSDSAttachmentsNew_module_scss_1.default.fileList }, (_c = field.value) === null || _c === void 0 ? void 0 : _c.map(function (file) { return (React.createElement("span", { key: file.name },
                            file.name,
                            ' ',
                            React.createElement(react_1.IconButton, { className: MSDSAttachmentsNew_module_scss_1.default.fileDeleteButton, iconProps: {
                                    iconName: 'Delete',
                                }, onClick: function () {
                                    field.onChange(function (prev) { return removeFile(prev, file.name); });
                                } }))); })))),
                    React.createElement(TextError_1.TextError, { error: fieldState.error && fieldState.error.message || "" })));
            } })));
};
exports.MSDSAttachmentsNew = MSDSAttachmentsNew;
//# sourceMappingURL=index.js.map