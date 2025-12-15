"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentSection = exports.COMMENT_SPINNER = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var sp_components_1 = require("sp-components");
var item_service_1 = require("../../services/item-service");
var lookup_service_1 = require("../../services/lookup-service");
var CommentItem_1 = require("../CommentItem");
var editor_1 = require("sp-components/dist/editor");
var CommentSection_module_scss_1 = tslib_1.__importDefault(require("./CommentSection.module.scss"));
exports.COMMENT_SPINNER = 'sp-msds/comment-spinner';
var CommentSection = function (props) {
    var _a = React.useState([]), comments = _a[0], setComments = _a[1];
    var _b = React.useState([]), users = _b[0], setUsers = _b[1];
    React.useEffect(function () {
        (0, sp_components_1.showSpinner)(exports.COMMENT_SPINNER);
        item_service_1.ItemService.getComments(props.item.Id)
            .then(function (comments) {
            setComments(comments);
            (0, sp_components_1.hideSpinner)(exports.COMMENT_SPINNER);
        })
            .catch(function (err) { return console.error(err); });
        lookup_service_1.LookupServiceCached.getSiteUsers()
            .then(function (users) { return setUsers(users.filter(function (u) { return u.Email !== ''; })); })
            .catch(function (err) { return console.error(err); });
    }, []);
    return (React.createElement("div", { className: "".concat(CommentSection_module_scss_1.default.container, " ").concat(props.className) },
        React.createElement(sp_components_1.LoadingSpinner, { id: exports.COMMENT_SPINNER, type: "absolute" }),
        React.createElement(react_1.Text, { variant: "mediumPlus" }, "Comments"),
        React.createElement(editor_1.CommentEditor, { users: users, onAddComment: function (comment) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                var added;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            (0, sp_components_1.showSpinner)(exports.COMMENT_SPINNER);
                            return [4 /*yield*/, item_service_1.ItemService.addComment(props.item.Id, {
                                    text: comment.text,
                                    mentions: comment.mentions,
                                })];
                        case 1:
                            added = _a.sent();
                            setComments(function (prev) {
                                (0, sp_components_1.hideSpinner)(exports.COMMENT_SPINNER);
                                return tslib_1.__spreadArray([added], prev, true);
                            });
                            return [2 /*return*/];
                    }
                });
            }); } }),
        React.createElement(react_1.Stack, null, comments.map(function (c) { return (React.createElement(CommentItem_1.CommentItem, { key: c.id, comment: c, setComments: setComments, currentUser: props.currentUser })); }))));
};
exports.CommentSection = CommentSection;
//# sourceMappingURL=index.js.map