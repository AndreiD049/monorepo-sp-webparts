"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsdsForm = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var sp_core_library_1 = require("@microsoft/sp-core-library");
var MSDSCheckbox_1 = require("./MSDSCheckbox");
var MSDSDatePicker_1 = require("./MSDSDatePicker");
var MSDSTextField_1 = require("./MSDSTextField");
var CustomsCodeField_1 = require("./CustomsCodeField");
var lookup_service_1 = require("../services/lookup-service");
var MsdsTagPickerField_1 = require("./MsdsTagPickerField");
var useCustomers_1 = require("../hooks/useCustomers");
var useDatabases_1 = require("../hooks/useDatabases");
var useSites_1 = require("../hooks/useSites");
var react_1 = require("@fluentui/react");
var useMaterialTypes_1 = require("../hooks/useMaterialTypes");
var useFormShape_1 = require("../hooks/useFormShape");
var useColor_1 = require("../hooks/useColor");
var useWarehouseType_1 = require("../hooks/useWarehouseType");
var useProductTypes_1 = require("../hooks/useProductTypes");
var MSDSSpinButton_1 = require("./MSDSSpinButton");
var useHazardousGoodsCode_1 = require("../hooks/useHazardousGoodsCode");
var Collapsible_1 = require("./Collapsible");
var react_hook_form_1 = require("react-hook-form");
var item_service_1 = require("../services/item-service");
var Buttons_1 = require("./Buttons");
var MSDSAttachmentsNew_1 = require("./MSDSAttachmentsNew");
var useFields_1 = require("../hooks/useFields");
var sp_components_1 = require("sp-components");
var constants_1 = require("../constants");
var useAttachments_1 = require("../hooks/useAttachments");
var MsdsAttachmentsDetails_1 = require("./MsdsAttachmentsDetails");
var useFieldEffects_1 = require("../hooks/useFieldEffects");
var useApprovers_1 = require("../hooks/useApprovers");
var useCurrentUser_1 = require("../hooks/useCurrentUser");
var Logo_1 = require("./Logo");
var KTNLogo_1 = tslib_1.__importDefault(require("./KTNLogo"));
var MsdsForm_module_scss_1 = tslib_1.__importDefault(require("./MsdsForm.module.scss"));
var utils_1 = require("../utils");
var MsdsCommandBar_1 = require("./MsdsCommandBar");
function encodeItem(item) {
    var _a, _b, _c, _d, _e, _f, _g;
    var result = tslib_1.__assign({}, item);
    if (result.ProductRemarks) {
        result.ProductRemarks = (0, utils_1.encodeXML)((_a = item.ProductRemarks) !== null && _a !== void 0 ? _a : "");
    }
    if (result.SiloRemarks) {
        result.SiloRemarks = (0, utils_1.encodeXML)((_b = item.SiloRemarks) !== null && _b !== void 0 ? _b : "");
    }
    if (result.DescriptionOnLabel) {
        result.DescriptionOnLabel = (0, utils_1.encodeXML)((_c = item.DescriptionOnLabel) !== null && _c !== void 0 ? _c : "");
    }
    if (result.SafetyRemarks) {
        result.SafetyRemarks = (0, utils_1.encodeXML)((_d = item.SafetyRemarks) !== null && _d !== void 0 ? _d : "");
    }
    if (result.ProductName) {
        result.ProductName = (0, utils_1.encodeXML)((_e = item.ProductName) !== null && _e !== void 0 ? _e : "");
    }
    if (result.DedicatedFlexiblesValves) {
        result.DedicatedFlexiblesValves = (0, utils_1.encodeXML)((_f = item.DedicatedFlexiblesValves) !== null && _f !== void 0 ? _f : "");
    }
    if (result.MOC) {
        result.MOC = (0, utils_1.encodeXML)((_g = item.MOC) !== null && _g !== void 0 ? _g : "");
    }
    return result;
}
function decodeItem(item) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!item) {
        return {};
    }
    var result = tslib_1.__assign({}, item);
    if (result.ProductRemarks) {
        result.ProductRemarks = (0, utils_1.decodeXML)((_a = item.ProductRemarks) !== null && _a !== void 0 ? _a : "");
    }
    if (result.SafetyRemarks) {
        result.SafetyRemarks = (0, utils_1.decodeXML)((_b = item.SafetyRemarks) !== null && _b !== void 0 ? _b : "");
    }
    if (result.SiloRemarks) {
        result.SiloRemarks = (0, utils_1.decodeXML)((_c = item.SiloRemarks) !== null && _c !== void 0 ? _c : "");
    }
    if (result.DescriptionOnLabel) {
        result.DescriptionOnLabel = (0, utils_1.decodeXML)((_d = item.DescriptionOnLabel) !== null && _d !== void 0 ? _d : "");
    }
    if (result.ProductName) {
        result.ProductName = (0, utils_1.decodeXML)((_e = item.ProductName) !== null && _e !== void 0 ? _e : "");
    }
    if (result.DedicatedFlexiblesValves) {
        result.DedicatedFlexiblesValves = (0, utils_1.decodeXML)((_f = item.DedicatedFlexiblesValves) !== null && _f !== void 0 ? _f : "");
    }
    if (result.MOC) {
        result.MOC = (0, utils_1.decodeXML)((_g = item.MOC) !== null && _g !== void 0 ? _g : "");
    }
    return result;
}
var MsdsForm = function (_a) {
    var _b, _c, _d;
    var CommentSection = _a.CommentSection, props = tslib_1.__rest(_a, ["CommentSection"]);
    var _e = React.useState({
        applicant: true,
        approver: props.displayMode === sp_core_library_1.FormDisplayMode.New ? false : true,
    }), collapsedBlocks = _e[0], setCollapsedBlocks = _e[1];
    var _f = React.useState([]), disabledFields = _f[0], setdisabledFields = _f[1];
    var _g = (0, react_hook_form_1.useForm)({
        mode: 'onChange',
        defaultValues: {
            Urgency: 'Medium',
            WarehouseType: 'Default (non-hazardous)',
        },
        values: decodeItem(props.item),
    }), control = _g.control, handleSubmit = _g.handleSubmit, setValue = _g.setValue, watch = _g.watch, _h = _g.formState, dirtyFields = _h.dirtyFields, isDirty = _h.isDirty;
    var site = (_b = watch('Site')) !== null && _b !== void 0 ? _b : "";
    var msdsPermittedYears = (0, utils_1.getPermittedYearsPerSite)(site !== null && site !== void 0 ? site : "");
    var database = watch('Database');
    var materialType = watch('MaterialType');
    var hasSDS = watch('HasMsds');
    var field = (0, useFields_1.useFields)(site);
    var customers = (0, useCustomers_1.useCustomers)(database !== null && database !== void 0 ? database : "", (_c = props.item) === null || _c === void 0 ? void 0 : _c.CustomerNameId);
    var databases = (0, useDatabases_1.useDatabases)(site);
    var approvers = (0, useApprovers_1.useApprovers)(site);
    var currentUser = (0, useCurrentUser_1.useCurrentUser)();
    // WARNING: whether current user is an approver will be decided based
    // on the first approver in the list.
    // It is possible that there are multiple lines for a single site,
    // so that user will not be considered and approver.
    // TODO: check possibility to also take Database into consideration
    var isCurrentUserApprover = React.useMemo(function () {
        if (currentUser && approvers.options.length > 0) {
            var nonEmptyApprovers = approvers.options.filter(function (a) {
                return a.HSEQresponsable !== undefined &&
                    a.HSEQresponsable.length > 0;
            });
            if (nonEmptyApprovers.length === 0) {
                return false;
            }
            return (nonEmptyApprovers[0].HSEQresponsable.find(function (a) { return a.Id === currentUser.Id; }) !== undefined);
        }
        return false;
    }, [currentUser, approvers]);
    var sites = (0, useSites_1.useSites)();
    var materialTypes = (0, useMaterialTypes_1.useMaterialTypes)();
    var formShapes = (0, useFormShape_1.useFormShape)();
    var colors = (0, useColor_1.useColors)();
    var whtypes = (0, useWarehouseType_1.useWarehouseTypes)();
    var urgencyTags = ['Low', 'Medium', 'High'].map(function (u) { return ({
        key: u,
        name: u,
    }); });
    var productTypes = (0, useProductTypes_1.useProductTypes)();
    var hazardousGoodsCodes = (0, useHazardousGoodsCode_1.useHazardousGoodsCodes)();
    var attachments = (0, useAttachments_1.useAttachments)(((_d = props.item) === null || _d === void 0 ? void 0 : _d.Id) || -1);
    var handleFilter = React.useCallback(function (tags, filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var filterLower;
        return tslib_1.__generator(this, function (_a) {
            filterLower = filter.toLowerCase();
            return [2 /*return*/, tags.filter(function (tag) { return tag.name.toLowerCase().indexOf(filterLower) !== -1; })];
        });
    }); }, []);
    var CreateOrSave = React.useCallback(function (data) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var payload, addedItem, payload, key, element;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 8, 9]);
                    (0, sp_components_1.showSpinner)(constants_1.SPINNER_ID);
                    if (!(props.displayMode === sp_core_library_1.FormDisplayMode.New)) return [3 /*break*/, 4];
                    payload = encodeItem(data);
                    payload.IsApprovalNeeded = true;
                    return [4 /*yield*/, item_service_1.ItemService.createItem(payload)];
                case 1:
                    addedItem = _a.sent();
                    if (!(data.Attachments && data.Attachments.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, item_service_1.ItemService.addAttachments(addedItem.data.Id, data.Attachments)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    props.onSave();
                    return [3 /*break*/, 7];
                case 4:
                    payload = {};
                    // Only add modified fields to the payload
                    for (key in data) {
                        if (Object.prototype.hasOwnProperty.call(data, key)) {
                            element = data[key];
                            // If field was modified, add it to the payload
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            if (dirtyFields[key]) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                payload[key] = element;
                            }
                        }
                    }
                    payload = encodeItem(payload);
                    // decide whether approval is needed
                    // if current user is an approver for the selected site, no approval needed
                    if (approvers.options.length > 0) {
                        payload.IsApprovalNeeded = !isCurrentUserApprover;
                    }
                    if (!props.item) return [3 /*break*/, 6];
                    return [4 /*yield*/, item_service_1.ItemService.updateItem(props.item.Id, payload)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    props.onSave();
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    (0, sp_components_1.hideSpinner)(constants_1.SPINNER_ID);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, [
        props.onSave,
        props.displayMode,
        dirtyFields,
        isCurrentUserApprover,
        approvers,
    ]);
    (0, useFieldEffects_1.useFieldEffects)(watch, isDirty, setValue, setdisabledFields);
    return (React.createElement("div", { className: MsdsForm_module_scss_1.default.formContainer },
        React.createElement("div", null,
            React.createElement("div", { className: "backgroundPrimaryColor", style: {
                    height: '120px',
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'center',
                    gap: '1em',
                } },
                React.createElement(KTNLogo_1.default, { style: { height: '100px', marginLeft: '1em' } }),
                React.createElement(react_1.Text, { variant: "xxLargePlus", className: MsdsForm_module_scss_1.default.headerText }, "Web application form")),
            props.item && (React.createElement(MsdsCommandBar_1.MsdsCommandBar, { item: props.item, onClose: props.onClose, displayMode: props.displayMode }))),
        React.createElement("form", { className: MsdsForm_module_scss_1.default.msdsForm, onSubmit: handleSubmit(CreateOrSave) },
            React.createElement("div", null,
                React.createElement("div", { className: MsdsForm_module_scss_1.default.padLeft },
                    React.createElement("div", { style: {
                            display: 'flex',
                            flexFlow: 'row nowrap',
                            gap: '.5em',
                            alignItems: 'center',
                        } },
                        React.createElement(Logo_1.Logo, { style: {
                                marginTop: '.5em',
                                minWidth: '30px',
                                width: '30px',
                            } }),
                        React.createElement(react_1.Text, { variant: "medium" },
                            ' ',
                            "\u2013 Fields that will affect PLATO")),
                    React.createElement(sp_components_1.LoadingSpinner, { id: constants_1.SPINNER_ID }),
                    React.createElement(sp_components_1.Dialog, { id: constants_1.DIALOG_ID }),
                    React.createElement(Collapsible_1.Collapsible, { headerText: "Applicant", isOpen: collapsedBlocks.applicant, onToggle: function () {
                            return (0, Collapsible_1.handleToggle)('applicant', setCollapsedBlocks);
                        } },
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1) },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "Site", label: "1. Site", title: "Application where SITE can be find", tags: sites.tags, handleFilter: function (filter) {
                                        return handleFilter(sites.tags, filter);
                                    }, control: control, rules: { required: 'Site is required' } })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "Database", label: "2.Database", title: "Application where SITE can be found", tags: databases.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            return [2 /*return*/, handleFilter(databases.tags, filter)];
                                        });
                                    }); }, control: control, rules: {
                                        required: 'Database is required',
                                        disabled: field.Database === 'Disabled',
                                    } })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "MaterialType", label: "3.Material type", tags: materialTypes.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            return [2 /*return*/, handleFilter(materialTypes.tags, filter)];
                                        });
                                    }); }, control: control, rules: {
                                        required: 'Material type is required',
                                        disabled: field.MaterialType ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "HasMsds", label: "4.Do you have an SDS? / Not older than ".concat(msdsPermittedYears, " years"), title: "16 sections / guidelines / Max ".concat(msdsPermittedYears, " years old"), control: control, rules: {
                                        disabled: field.HasMsds === 'Disabled',
                                    } }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSDatePicker_1.MSDSDatePicker, { id: "MSDSDate", label: "5.Latest SDS issued / revised", pickerProps: {
                                        maxDate: new Date(),
                                        allowTextInput: true,
                                    }, control: control, rules: {
                                        required: materialType ===
                                            'Finished goods'
                                            ? 'MSDS Date is required'
                                            : false,
                                        disabled: field.MSDSDate === 'Disabled',
                                        validate: function (value) {
                                            var _a;
                                            var todayMinusYears = new Date(new Date().setFullYear(new Date().getFullYear() -
                                                msdsPermittedYears));
                                            var date = new Date(value);
                                            if (hasSDS &&
                                                date < todayMinusYears) {
                                                (_a = document
                                                    .getElementById('MSDSDate')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'center',
                                                    inline: 'center',
                                                });
                                                return "SDS Date must be within the last ".concat(msdsPermittedYears, " years");
                                            }
                                            return true;
                                        },
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "CasNo", label: "6.SDS Cas No.", title: "CAS Registry Number is a unique numerical identifier assigned by Chemical Abstracts Service CAS", control: control, rules: {
                                        disabled: field.CasNo === 'Disabled',
                                        maxLength: {
                                            value: 30,
                                            message: 'Cas No. cannot be longer than 30 characters',
                                        },
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "CustomerNameId", label: "7.Customer name in Plato", tags: customers.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        var customerItems;
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, lookup_service_1.LookupService.getCustomerFilter(filter, database || '')];
                                                case 1:
                                                    customerItems = _a.sent();
                                                    return [2 /*return*/, customerItems.map(function (c) { return ({
                                                            name: c.Title,
                                                            key: c.Id,
                                                        }); })];
                                            }
                                        });
                                    }); }, handleSelect: function (tag) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        var customer_1;
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!tag) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, lookup_service_1.LookupServiceCached.getCustomer(+tag.key)];
                                                case 1:
                                                    customer_1 = _a.sent();
                                                    customers.set(function (prev) {
                                                        if (!prev.find(function (c) {
                                                            return c.Id ===
                                                                customer_1.Id;
                                                        })) {
                                                            return tslib_1.__spreadArray(tslib_1.__spreadArray([], prev, true), [
                                                                customer_1,
                                                            ], false);
                                                        }
                                                        return prev;
                                                    });
                                                    _a.label = 2;
                                                case 2: return [2 /*return*/];
                                            }
                                        });
                                    }); }, control: control, rules: {
                                        required: 'Customer is required',
                                        disabled: field.CustomerName ===
                                            'Disabled' ||
                                            Boolean(database) === false,
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "ProductName", label: "8.Product name to create in Plato", title: "if created product name \u2260 name on SDS, confirmation of customer to be attached", control: control, rules: {
                                        required: 'Product name is required',
                                        disabled: field.ProductName ===
                                            'Disabled',
                                        pattern: {
                                            value: /^[a-zA-Z0-9\s.-]+$/,
                                            message: "PLATO doesn't allow special characters in product names. Please adjust the product name accordingly.",
                                        },
                                        maxLength: {
                                            value: 35,
                                            message: 'PLATO cannot handle product names longer than 35 characters',
                                        },
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(CustomsCodeField_1.CustomsCodeField, { id: "CustomsCode", label: "9.Customs code", title: "Important for Customs formalities - not on SDS - to be confirmed with customer by mail - MUST ALWAYS be mentioned also in case of no customs: 0000000000", fieldProps: {
                                        mask: '9999999999',
                                    }, control: control, rules: {
                                        required: 'Customs code is required',
                                        disabled: field.CustomsCode ===
                                            'Disabled',
                                        minLength: {
                                            message: 'Customs code should be 10 digits',
                                            value: 10,
                                        },
                                        maxLength: {
                                            message: 'Customs code should be 10 digits',
                                            value: 10,
                                        },
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "FormShape", label: "10.Form / Shape", tags: formShapes.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            return [2 /*return*/, handleFilter(formShapes.tags, filter)];
                                        });
                                    }); }, control: control, rules: {
                                        required: 'Form or shape is required',
                                        disabled: field.FormShape === 'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "Color", label: "11.What is the color of the product?", title: "Do not accept 'various colors'  -  'unknown'  -  'opal white' / If a color has been confirmed by customer on msds or mail, attach this here", tags: colors.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                                        return [2 /*return*/, handleFilter(colors.tags, filter)];
                                    }); }); }, control: control, rules: {
                                        required: 'Color is required',
                                        disabled: field.Color === 'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "PackedOperations", label: "12.PACKED OPERATIONS NEEDED?", control: control, rules: {
                                        disabled: field.PackedOperations ===
                                            'Disabled',
                                    } }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "WarehouseType", label: "13.Warehouse Type", title: "Extra customer specific requirements.  For instance for WH : f.i. heated or cold storage, \u2026", tags: whtypes.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                                        return [2 /*return*/, handleFilter(whtypes.tags, filter)];
                                    }); }); }, control: control, rules: {
                                        disabled: disabledFields.indexOf('WarehouseType') > -1 ||
                                            field.WarehouseType ===
                                                'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "DebaggingOperations", label: "14.DEBAGGING OPERATIONS NEEDED?", control: control, rules: {
                                        disabled: field.DebaggingOperations ===
                                            'Disabled',
                                    } })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "SiloOperations", label: "15.SILO OPERATION OPERATION NEEDED?", control: control, rules: {
                                        disabled: disabledFields.indexOf('SiloOperations') > -1 ||
                                            field.SiloOperations ===
                                                'Disabled',
                                    } })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "MeltingPoint", label: "16.Melting point? \u00B0C/\u00B0F", fieldProps: {
                                        suffix: '°C/°F',
                                        type: 'number',
                                        autoComplete: 'off',
                                    }, control: control, rules: {
                                        min: {
                                            message: 'Melting point cannot be negative',
                                            value: 0,
                                        },
                                        required: 'Melting point is required',
                                        disabled: disabledFields.indexOf('MeltingPoint') > -1 ||
                                            field.MeltingPoint ===
                                                'Disabled',
                                    } }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "Abrasive", label: "17.Abrasive? Filled with short glass fiber", title: "Glass filled granulate is an information that is normally mentioned.", control: control, rules: {
                                        disabled: disabledFields.indexOf('Abrasive') > -1 ||
                                            field.Abrasive === 'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "Hygroscopic", label: "18.Hygroscopic? Tending to absorb moisture, water from air.", title: "Not always clear on SDS, to be confirmed by customer!  Aluminium bags or liner is an indication.  Section 7", control: control, rules: {
                                        disabled: disabledFields.indexOf('Hygroscopic') > -1 ||
                                            field.Hygroscopic ===
                                                'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "ForbiddenMixedSites", label: "19.Forbidden mixed production site in silo?", title: "Default = YES No mix of same producttype produced at different plants may be mixed. ", control: control, rules: {
                                        disabled: disabledFields.indexOf('ForbiddenMixedSites') > -1 ||
                                            field.ForbiddenMixedSites ===
                                                'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "DedicatedFlexiblesValves", label: "20.Dedicated Flexible(s)? Rotary Valve(s)?", title: "Operational or customer service knowledge for dedicated equipment if any", fieldProps: {
                                        multiline: true,
                                        autoAdjustHeight: true,
                                    }, control: control, rules: {
                                        disabled: disabledFields.indexOf('DedicatedFlexiblesValves') > -1 ||
                                            field.DedicatedFlexiblesValves ===
                                                'Disabled',
                                    } }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "DescriptionOnLabel", label: "21.Description on label?", title: "In case a customer requires a specific mark or sign on the labels.  F.i. DUPONT requires  \u00AE", control: control, rules: {
                                        disabled: field.DescriptionOnLabel ===
                                            'Disabled',
                                        maxLength: {
                                            value: 35,
                                            message: 'Description on label can be 35 characters max',
                                        },
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "SDSPublisher", label: "22. SDS Publisher", tags: customers.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        var customerItems;
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, lookup_service_1.LookupService.getCustomerFilter(filter, database || '')];
                                                case 1:
                                                    customerItems = _a.sent();
                                                    return [2 /*return*/, customerItems.map(function (c) { return ({
                                                            name: c.Title,
                                                            key: c.Id,
                                                        }); })];
                                            }
                                        });
                                    }); }, handleSelect: function (tag) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        var customer_2;
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!tag) return [3 /*break*/, 2];
                                                    console.log(tag);
                                                    return [4 /*yield*/, lookup_service_1.LookupServiceCached.getCustomer(+tag.key)];
                                                case 1:
                                                    customer_2 = _a.sent();
                                                    customers.set(function (prev) {
                                                        if (!prev.find(function (c) {
                                                            return c.Id ===
                                                                customer_2.Id;
                                                        })) {
                                                            return tslib_1.__spreadArray(tslib_1.__spreadArray([], prev, true), [
                                                                customer_2,
                                                            ], false);
                                                        }
                                                        return prev;
                                                    });
                                                    _a.label = 2;
                                                case 2: return [2 /*return*/];
                                            }
                                        });
                                    }); }, getValue: function (option) { return option.name; }, control: control, rules: {
                                        required: 'SDS Publisher is required',
                                        disabled: field.SDSPublisher ===
                                            'Disabled' ||
                                            Boolean(database) === false,
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "ProductNameOnSDS", label: "23. Product name on SDS", control: control, rules: {
                                        disabled: field.ProductNameOnSDS ===
                                            'Disabled',
                                        maxLength: {
                                            value: 80,
                                            message: 'Product name on SDS can be 80 characters max',
                                        },
                                        pattern: {
                                            value: /^[a-zA-Z0-9\s_.-]+$/,
                                            message: 'Special characters are not allowed',
                                        },
                                        required: 'Product name on SDS is required',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "SDSVersion", label: "24. SDS Version", control: control, rules: {
                                        disabled: field.SDSVersion === 'Disabled',
                                        maxLength: {
                                            value: 25,
                                            message: 'SDS Version can be 80 characters max',
                                        },
                                        pattern: {
                                            value: /^[a-zA-Z0-9\s_.-]+$/,
                                            message: 'Special characters are not allowed',
                                        },
                                        required: 'SDS Version is required',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "DescriptionOnDriversDocument", label: "25. Description on drivers document", control: control, rules: {
                                        disabled: field.DescriptionOnDriversDocument ===
                                            'Disabled',
                                        maxLength: {
                                            value: 60,
                                            message: 'Description on drivers document can be 60 characters max',
                                        },
                                        pattern: {
                                            value: /^[a-zA-Z0-9\s_.-]+$/,
                                            message: 'Special characters are not allowed',
                                        },
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "Urgency", label: "26.Urgency", tags: urgencyTags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                                        return [2 /*return*/, handleFilter(urgencyTags, filter)];
                                    }); }); }, control: control, rules: {
                                        required: 'Urgency is required',
                                        disabled: field.Urgency === 'Disabled',
                                    } }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-25p" }, props.displayMode ===
                                sp_core_library_1.FormDisplayMode.New ? (React.createElement(MSDSAttachmentsNew_1.MSDSAttachmentsNew, { id: "Attachments", label: "27.Attachments (NOTE: Name SDS PDF as product name)", control: control, title: "Add SDS PDF and customer confirmation mail. ", rules: {
                                    required: materialType !==
                                        'Packaging material'
                                        ? 'Attachments are required'
                                        : false,
                                } })) : (props.item && (React.createElement(MsdsAttachmentsDetails_1.MsdsAttachmentsDetails, { id: "Attachments", label: "23.Attachments (NOTE: Name SDS PDF as product name)", title: "Add SDS PDF and customer confirmation mail. NOTE: Rename the SDS file to the product name before uploading.", displayMode: props.displayMode, attachments: attachments, required: true, itemId: props.item.Id })))))),
                    React.createElement(Collapsible_1.Collapsible, { headerText: "HSEQ Approver", isOpen: collapsedBlocks.approver, onToggle: function () {
                            return (0, Collapsible_1.handleToggle)('approver', setCollapsedBlocks);
                        } },
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1) },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "StorageManipApproved", label: "1.Storage and manipulation of the product allowed", title: "Check if product can be stored according your permit (f.i. amount of dangerous goods).", control: control, rules: {
                                        disabled: field.StorageManipApproved ===
                                            'Disabled',
                                    } })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "ProductType", label: "2.Product type", tags: productTypes.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            return [2 /*return*/, handleFilter(productTypes.tags, filter)];
                                        });
                                    }); }, control: control, rules: {
                                        required: isCurrentUserApprover
                                            ? 'Product type is required'
                                            : false,
                                        disabled: field.ProductType ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "ForbiddenForBulk", label: "3.Forbidden for bulk?", title: "See product type forbidden = Emulsion PVC, rubber,\u2026 / Melting point <50\u00B0C / \u2026", control: control, rules: {
                                        disabled: field.ForbiddenForBulk ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSSpinButton_1.MSDSSpinButton, { id: "BulkDensity", label: "4.Bulk density Plato", control: control, title: "Density must be measured and tapped for Granulates + only measured for Powder, flakes and fluff.", rules: {
                                        disabled: disabledFields.indexOf('BulkDensity') > -1 ||
                                            field.BulkDensity ===
                                                'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "MeasuredBulkDensity", label: "5. Measured bulk density", control: control, rules: {
                                        disabled: disabledFields.indexOf('MeasuredBulkDensity') > -1 ||
                                            field.MeasuredBulkDensity ===
                                                'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "ManipNotAllowed", label: "6.Manipulation(change) not allowed", control: control, rules: {
                                        disabled: field.ManipNotAllowed ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "ProductRemarks", label: "7.Product remarks", title: "f.i.Glassfilled product.", fieldProps: {
                                        multiline: true,
                                        autoAdjustHeight: true,
                                    }, control: control, rules: {
                                        disabled: field.ProductRemarks ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "SafetyRemarks", label: "8.SAFETY REMARKS Printed on each order.", title: "F.i. Fire fighting equipment, storage & handling conditions, dust explosion => earthing", fieldProps: {
                                        multiline: true,
                                        autoAdjustHeight: true,
                                    }, control: control, rules: {
                                        disabled: field.SafetyRemarks ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "SiloRemarks", label: "9.REMARKS SILO operations", title: "F.i. sticky product  (stick potentials) may not be stored in silos in the outer rows of the silo battery.", fieldProps: {
                                        multiline: true,
                                        autoAdjustHeight: true,
                                    }, control: control, rules: {
                                        disabled: field.SiloRemarks ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MsdsTagPickerField_1.MsdsTagPickerField, { id: "HazardousGoods", label: "10.HAZARDOUS GOODS products code", title: "Check section 2 of MSDS pdf", tags: hazardousGoodsCodes.tags, handleFilter: function (filter) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            return [2 /*return*/, handleFilter(hazardousGoodsCodes.tags, filter)];
                                        });
                                    }); }, control: control, rules: {
                                        disabled: field.HazardousGoods ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "DustCategory", label: "11.Dust category", title: "If shape FLUFF/Powder check dust category(For Approver)", control: control, rules: {
                                        disabled: field.DustCategory ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })),
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "NitrogenCoverage", label: "12.Nitrogen coverage", control: control, rules: {
                                        disabled: field.NitrogenCoverage ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) }))),
                        React.createElement("div", { className: "".concat(MsdsForm_module_scss_1.default.msdsRow, " ").concat(MsdsForm_module_scss_1.default.msdsGap1, " margin-top-2") },
                            React.createElement("div", { className: "width-20p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "ClientRequirementsFnF", label: "13.Client requirements on food & feed (GMP) regulations?", control: control, rules: {
                                        disabled: field.ClientRequirementsFnF ===
                                            'Disabled',
                                    } })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSTextField_1.MSDSTextField, { id: "MOC", label: "14.MOC Management of change", title: "CONSULTATION + INFORMATION when changing product, operation or conditions mark  + forward this form", fieldProps: {
                                        multiline: true,
                                        autoAdjustHeight: true,
                                    }, control: control, rules: {
                                        disabled: field.MOC === 'Disabled',
                                    } })),
                            React.createElement("div", { className: "width-25p" },
                                React.createElement(MSDSCheckbox_1.MSDSCheckbox, { id: "ExtraCheckNeeded", label: "15.Extra check needed by quality in Plato ? Approver product will activate PM in Plato!", control: control, rules: {
                                        disabled: field.ExtraCheckNeeded ===
                                            'Disabled',
                                    }, icon: React.createElement(Logo_1.Logo, { style: {
                                            marginRight: '.3em',
                                            minWidth: '20px',
                                            width: '20px',
                                        } }) })))),
                    React.createElement(Buttons_1.Buttons, { displayMode: props.displayMode, onClose: props.onClose, onSave: props.onSave })),
                CommentSection && props.item && (React.createElement(CommentSection, { className: MsdsForm_module_scss_1.default.commentSection, item: props.item, currentUser: currentUser }))))));
};
exports.MsdsForm = MsdsForm;
//# sourceMappingURL=MsdsForm.js.map