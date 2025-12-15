"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyTo = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var React = tslib_1.__importStar(require("react"));
var sp_components_1 = require("sp-components");
var constants_1 = require("../../constants");
var item_service_1 = require("../../services/item-service");
var lookup_service_1 = require("../../services/lookup-service");
var CopyTo_module_scss_1 = tslib_1.__importDefault(require("./CopyTo.module.scss"));
var emptyErrors = {
    general: '',
    site: '',
    database: '',
    customer: '',
};
var CopyTo = function (props) {
    var _a = React.useState(tslib_1.__assign({}, emptyErrors)), errors = _a[0], setErrors = _a[1];
    var _b = React.useState({
        sites: props.sites,
        dbs: props.databasesInit,
        customers: props.customersInit,
    }), lookup = _b[0], setLookup = _b[1];
    var _c = React.useState({
        CustomerNameId: props.item.CustomerNameId,
        Site: props.item.Site,
        Database: props.item.Database,
    }), data = _c[0], setData = _c[1];
    var siteTags = lookup.sites.map(function (site) {
        return {
            key: site,
            name: site,
        };
    });
    var databaseTags = lookup.dbs.map(function (database) {
        return {
            key: database,
            name: database,
        };
    });
    var customerTags = lookup.customers.map(function (customer) {
        return {
            key: customer.Id,
            name: customer.Title,
        };
    });
    var handleFilter = function (tags) { return function (filter, selected) {
        if (!filter) {
            return tags;
        }
        return tags.filter(function (tag) {
            var _a;
            return tag.name.toLowerCase().includes(filter.toLowerCase()) &&
                selected &&
                tag.name !== ((_a = selected[0]) === null || _a === void 0 ? void 0 : _a.name);
        });
    }; };
    var handleCustomerFilter = function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var customers;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!filter) {
                        return [2 /*return*/, customerTags];
                    }
                    return [4 /*yield*/, lookup_service_1.LookupService.getCustomerFilter(filter, data.Database || '')];
                case 1:
                    customers = _a.sent();
                    return [2 /*return*/, customers.map(function (c) { return ({
                            key: c.Id,
                            name: c.Title,
                        }); })];
            }
        });
    }); };
    var validate = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var isValid, duplicate;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isValid = true;
                    if (!data.Site) {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { site: 'Site is required.' })); });
                        isValid = false;
                    }
                    else {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { site: '' })); });
                    }
                    if (!data.Database) {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { database: 'Database is required.' })); });
                        isValid = false;
                    }
                    else {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { database: '' })); });
                    }
                    if (!data.CustomerNameId) {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { customer: 'Customer is required.' })); });
                        isValid = false;
                    }
                    else {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { customer: '' })); });
                    }
                    if (!isValid) {
                        return [2 /*return*/, false];
                    }
                    if (data.CustomerNameId == undefined) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, item_service_1.ItemService.getItem(+data.CustomerNameId, data.Site, data.Database, props.item.ProductName)];
                case 1:
                    duplicate = _a.sent();
                    if (duplicate.length > 0) {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { general: "Product '".concat(props.item.ProductName, "' already exists for this customer/site/database.") })); });
                        isValid = false;
                    }
                    else {
                        setErrors(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { general: '' })); });
                    }
                    return [2 /*return*/, isValid];
            }
        });
    }); };
    console.log(props.item);
    var handleOk = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var valid, payload_1, result, customer, comment;
        var _a, _b, _c, _d;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, , 10, 11]);
                    (_a = document
                        .getElementById('copy-to-ok-button')) === null || _a === void 0 ? void 0 : _a.setAttribute('disabled', 'true');
                    (_b = document
                        .getElementById('copy-to-cancel-button')) === null || _b === void 0 ? void 0 : _b.setAttribute('disabled', 'true');
                    return [4 /*yield*/, validate()];
                case 1:
                    valid = _e.sent();
                    if (!valid)
                        throw new Error('Invalid form data');
                    (0, sp_components_1.hideDialog)(constants_1.DIALOG_ID);
                    (0, sp_components_1.showSpinner)(constants_1.SPINNER_ID);
                    payload_1 = tslib_1.__assign(tslib_1.__assign({}, props.item), data);
                    // remove odata properties and ids
                    Object.keys(payload_1).forEach(function (key) {
                        if (key.startsWith('@odata') || key.toLowerCase() === 'id') {
                            delete payload_1[key];
                        }
                    });
                    return [4 /*yield*/, item_service_1.ItemService.createItem(payload_1)];
                case 2:
                    result = _e.sent();
                    // Copy attachments
                    return [4 /*yield*/, item_service_1.ItemService.copyAttachments(props.item.Id, result.data.Id)];
                case 3:
                    // Copy attachments
                    _e.sent();
                    if (!props.item.CustomerNameId) {
                        console.error('props.item.CustomerNameId is undefined or null');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, lookup_service_1.LookupService.getCustomer(props.item.CustomerNameId)];
                case 4:
                    customer = _e.sent();
                    comment = "Copied from: <a href=\"".concat(location.href, "\" target=\"_blank\">").concat(props.item.Site, " - ").concat(customer.Title, " - ").concat(props.item.ProductName, "</a>");
                    return [4 /*yield*/, item_service_1.ItemService.addComment(result.data.Id, { text: comment })];
                case 5:
                    _e.sent();
                    if (!(data.Site === props.item.Site)) return [3 /*break*/, 7];
                    return [4 /*yield*/, item_service_1.ItemService.setApprovalStatus(result.data.Id, 'Pending', false)];
                case 6:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, item_service_1.ItemService.setApprovalStatus(result.data.Id, 'Pending', true)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9:
                    (0, sp_components_1.hideSpinner)(constants_1.SPINNER_ID);
                    props.onClose();
                    return [3 /*break*/, 11];
                case 10:
                    (0, sp_components_1.hideSpinner)(constants_1.SPINNER_ID);
                    (_c = document
                        .getElementById('copy-to-ok-button')) === null || _c === void 0 ? void 0 : _c.removeAttribute('disabled');
                    (_d = document
                        .getElementById('copy-to-cancel-button')) === null || _d === void 0 ? void 0 : _d.removeAttribute('disabled');
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: CopyTo_module_scss_1.default.container },
        React.createElement("form", { onSubmit: function (ev) { return ev.preventDefault(); } },
            errors.general && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error }, errors.general)),
            React.createElement(react_1.Label, { htmlFor: "copy-to-site" }, "Site:"),
            React.createElement(react_1.TagPicker, { inputProps: { id: 'copy-to-site', required: true }, onEmptyResolveSuggestions: function () { return siteTags; }, onResolveSuggestions: handleFilter(siteTags), itemLimit: 1, selectedItems: siteTags.filter(function (tag) { return tag.name === data.Site; }), onChange: function (selected) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var value, newDbs_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                value = selected && selected.length > 0 ? selected[0].name : null;
                                if (!(value !== null)) return [3 /*break*/, 2];
                                return [4 /*yield*/, lookup_service_1.LookupService.getDatabases(value)];
                            case 1:
                                newDbs_1 = _a.sent();
                                setLookup(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { dbs: newDbs_1 })); });
                                return [3 /*break*/, 3];
                            case 2:
                                setLookup(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { dbs: [] })); });
                                _a.label = 3;
                            case 3:
                                setData({
                                    Site: value || '',
                                    Database: '',
                                    CustomerNameId: null,
                                });
                                return [2 /*return*/, selected];
                        }
                    });
                }); } }),
            errors.site && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error }, errors.site)),
            React.createElement(react_1.Label, { htmlFor: "copy-to-database" }, "Database:"),
            React.createElement(react_1.TagPicker, { inputProps: { id: 'copy-to-database', required: true }, onEmptyResolveSuggestions: function () { return databaseTags; }, onResolveSuggestions: handleFilter(databaseTags), itemLimit: 1, selectedItems: databaseTags.filter(function (tag) { return tag.name === data.Database; }), onChange: function (selected) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var value, newCustomers_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                value = (selected && selected.length > 0) ? selected[0].name : null;
                                if (!(value !== null)) return [3 /*break*/, 2];
                                return [4 /*yield*/, lookup_service_1.LookupService.getAllCustomers(value)];
                            case 1:
                                newCustomers_1 = _a.sent();
                                setLookup(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { customers: newCustomers_1 })); });
                                _a.label = 2;
                            case 2:
                                setData(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { Database: value !== null && value !== void 0 ? value : '', CustomerNameId: null })); });
                                return [2 /*return*/, selected];
                        }
                    });
                }); } }),
            errors.database && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error }, errors.database)),
            React.createElement(react_1.Label, { htmlFor: "copy-to-customer" }, "Customer:"),
            React.createElement(react_1.TagPicker, { inputProps: { id: 'copy-to-customer', required: true }, onEmptyResolveSuggestions: function () { return customerTags; }, onResolveSuggestions: handleCustomerFilter, itemLimit: 1, selectedItems: customerTags.filter(function (tag) { return tag.key === data.CustomerNameId; }), onChange: function (selected) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var value, exists, customer_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                value = selected && selected.length > 0
                                    ? selected[0].key
                                    : null;
                                if (!(value !== null)) return [3 /*break*/, 2];
                                exists = lookup.customers.find(function (c) { return c.Id === +value; });
                                if (!!exists) return [3 /*break*/, 2];
                                return [4 /*yield*/, lookup_service_1.LookupService.getCustomer(+value)];
                            case 1:
                                customer_1 = _a.sent();
                                setLookup(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { customers: tslib_1.__spreadArray(tslib_1.__spreadArray([], prev.customers, true), [customer_1], false) })); });
                                _a.label = 2;
                            case 2:
                                setData(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { CustomerNameId: value })); });
                                return [2 /*return*/, selected];
                        }
                    });
                }); } }),
            errors.customer && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error }, errors.customer))),
        React.createElement("div", { className: CopyTo_module_scss_1.default.footer },
            React.createElement(react_1.PrimaryButton, { id: "copy-to-ok-button", className: CopyTo_module_scss_1.default.okButton, onClick: handleOk }, "Ok"),
            React.createElement(react_1.DefaultButton, { id: "copy-to-cancel-button", onClick: function () { return (0, sp_components_1.hideDialog)(constants_1.DIALOG_ID); } }, "Cancel"))));
};
exports.CopyTo = CopyTo;
//# sourceMappingURL=index.js.map