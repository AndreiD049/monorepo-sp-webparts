"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
var tslib_1 = require("tslib");
var approvalToValue = {
    Approved: { value: '0', },
    Rejected: { value: '1', },
    Pending: { value: '2', },
    Draft: { value: '3', },
};
var ItemService = /** @class */ (function () {
    function ItemService() {
    }
    ItemService.InitService = function (sp) {
        this.sp = sp;
        this.applicationList = this.sp.web.lists.getByTitle('Web application form');
    };
    ItemService.getItem = function (customerId, site, database, product) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var items;
            return tslib_1.__generator(this, function (_a) {
                items = this.applicationList.items;
                return [2 /*return*/, items.filter("CustomerNameId eq ".concat(customerId, " and Site eq '").concat(site, "' and Database eq '").concat(database, "' and ProductName eq '").concat(product, "'"))()];
            });
        });
    };
    ItemService.createItem = function (payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var cleanedPayload;
            return tslib_1.__generator(this, function (_a) {
                cleanedPayload = tslib_1.__assign({}, payload);
                delete cleanedPayload.CustomerName;
                delete cleanedPayload.Attachments;
                return [2 /*return*/, this.applicationList.items.add(cleanedPayload)];
            });
        });
    };
    ItemService.setApprovalStatus = function (id, value, isApprovalNeeded) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var item, translation;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.applicationList.items.getById(id);
                        translation = approvalToValue[value];
                        if (!translation)
                            return [2 /*return*/];
                        return [4 /*yield*/, item.validateUpdateListItem([
                                {
                                    FieldName: '_ModerationStatus',
                                    FieldValue: translation.value,
                                },
                                {
                                    FieldName: 'IsApprovalNeeded',
                                    FieldValue: isApprovalNeeded ? '1' : '0',
                                },
                            ], true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ItemService.updateItem = function (id, payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.applicationList.items.getById(id).update(payload)];
            });
        });
    };
    ItemService.addAttachments = function (itemId, attachments) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _i, attachments_1, a, _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _i = 0, attachments_1 = attachments;
                        _d.label = 1;
                    case 1:
                        if (!(_i < attachments_1.length)) return [3 /*break*/, 5];
                        a = attachments_1[_i];
                        _b = (_a = this.applicationList.items
                            .getById(itemId)
                            .attachmentFiles).add;
                        _c = [a.name];
                        return [4 /*yield*/, a.arrayBuffer()];
                    case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ItemService.addAttachment = function (itemId, attachment) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = (_a = this.applicationList.items
                            .getById(itemId)
                            .attachmentFiles).add;
                        _c = [attachment.name];
                        return [4 /*yield*/, attachment.arrayBuffer()];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
                    case 2:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ItemService.getAttachments = function (itemId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.applicationList.items.getById(itemId).attachmentFiles()];
            });
        });
    };
    ItemService.copyAttachments = function (fromId, toId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var from, _i, from_1, a, content;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.applicationList.items
                            .getById(fromId)
                            .attachmentFiles()];
                    case 1:
                        from = _a.sent();
                        _i = 0, from_1 = from;
                        _a.label = 2;
                    case 2:
                        if (!(_i < from_1.length)) return [3 /*break*/, 6];
                        a = from_1[_i];
                        return [4 /*yield*/, this.sp.web.getFileByUrl(a.ServerRelativeUrl).getBlob()];
                    case 3:
                        content = _a.sent();
                        return [4 /*yield*/, this.applicationList.items
                                .getById(toId)
                                .attachmentFiles.add(a.FileName, content)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ItemService.getAttachmentUrl = function (relativePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var link;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sp.web.getFileByServerRelativePath(relativePath)()];
                    case 1:
                        link = _a.sent();
                        return [2 /*return*/, link.LinkingUrl || link.ServerRelativeUrl];
                }
            });
        });
    };
    ItemService.deleteAttachment = function (relativePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sp.web.getFileByServerRelativePath(relativePath).recycle()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ItemService.addComment = function (itemId, comment) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var item;
            return tslib_1.__generator(this, function (_a) {
                item = this.applicationList.items.getById(itemId);
                return [2 /*return*/, item.comments.add(comment)];
            });
        });
    };
    ItemService.getComments = function (itemId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.applicationList.items.getById(itemId).comments()];
            });
        });
    };
    ItemService.deleteComment = function (itemId, commentId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.applicationList.items
                            .getById(itemId)
                            .comments.getById(commentId)
                            .delete()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ItemService;
}());
exports.ItemService = ItemService;
//# sourceMappingURL=item-service.js.map