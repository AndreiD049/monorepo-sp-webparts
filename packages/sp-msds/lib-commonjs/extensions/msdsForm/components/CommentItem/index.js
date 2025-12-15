"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentItem = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var sp_components_1 = require("sp-components");
var constants_1 = require("../../constants");
var item_service_1 = require("../../services/item-service");
var CommentSection_1 = require("../CommentSection");
var CommentItem_module_scss_1 = tslib_1.__importDefault(require("./CommentItem.module.scss"));
var DOMPurify = tslib_1.__importStar(require("dompurify"));
var CommentText = function (props) {
    var decodedText = React.useMemo(function () {
        var txt = document.createElement('textarea');
        txt.innerHTML = props.comment.text;
        return DOMPurify.sanitize(txt.value);
    }, [props.comment.text]);
    return (React.createElement("div", { className: CommentItem_module_scss_1.default.commentText },
        React.createElement(react_1.Text, { variant: "small" },
            React.createElement("span", { dangerouslySetInnerHTML: { __html: decodedText } }))));
};
var CommentTimeStamp = function (props) {
    return (React.createElement(react_1.Text, { variant: "xSmall" }, new Date(props.comment.createdDate).toLocaleString()));
};
var CommentItem = function (props) {
    var isCurrentUser = React.useMemo(function () {
        if (props.currentUser && props.comment.author) {
            return (props.currentUser.Email.toLowerCase() ===
                props.comment.author.email.toLowerCase());
        }
        return false;
    }, [props.currentUser, props.comment]);
    return (React.createElement("div", { className: CommentItem_module_scss_1.default.container },
        React.createElement(react_1.ActivityItem, { activityDescription: React.createElement(react_1.Text, { variant: "small" },
                props.comment.author.name,
                " commented"), activityPersonas: [
                {
                    imageUrl: "/_layouts/15/userphoto.aspx?AccountName=".concat(props.comment.author.email, "&Size=M"),
                    size: react_1.PersonaSize.size32,
                },
            ], comments: React.createElement(CommentText, tslib_1.__assign({}, props)), timeStamp: React.createElement(CommentTimeStamp, tslib_1.__assign({}, props)) }),
        isCurrentUser && (React.createElement(react_1.IconButton, { className: CommentItem_module_scss_1.default.deleteIcon, iconProps: { iconName: 'Delete' }, onClick: function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    (0, sp_components_1.showDialog)({
                        id: constants_1.DIALOG_ID,
                        dialogProps: {
                            title: 'Delete comment',
                            subText: 'Comment will be deleted. Are you sure?',
                        },
                        footer: (React.createElement(sp_components_1.FooterYesNo, { onNo: function () { return (0, sp_components_1.hideDialog)(constants_1.DIALOG_ID); }, onYes: function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            (0, sp_components_1.showSpinner)(CommentSection_1.COMMENT_SPINNER);
                                            (0, sp_components_1.hideDialog)(constants_1.DIALOG_ID);
                                            return [4 /*yield*/, item_service_1.ItemService.deleteComment(props.comment.itemId, +props.comment.id)];
                                        case 1:
                                            _a.sent();
                                            props.setComments(function (prev) {
                                                (0, sp_components_1.hideSpinner)(CommentSection_1.COMMENT_SPINNER);
                                                return prev.filter(function (c) { return c.id !== props.comment.id; });
                                            });
                                            return [2 /*return*/];
                                    }
                                });
                            }); } })),
                    });
                    return [2 /*return*/];
                });
            }); } }))));
};
exports.CommentItem = CommentItem;
//# sourceMappingURL=index.js.map