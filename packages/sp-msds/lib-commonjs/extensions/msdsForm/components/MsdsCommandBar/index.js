"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsdsCommandBar = void 0;
var tslib_1 = require("tslib");
var react_1 = require("@fluentui/react");
var sp_core_library_1 = require("@microsoft/sp-core-library");
var React = tslib_1.__importStar(require("react"));
var sp_components_1 = require("sp-components");
var constants_1 = require("../../constants");
var lookup_service_1 = require("../../services/lookup-service");
var CopyTo_1 = require("../CopyTo");
var MsdsCommandBar_module_scss_1 = tslib_1.__importDefault(require("./MsdsCommandBar.module.scss"));
var buttonStyles = {
    backgroundColor: 'inherit',
    color: 'inherit',
};
var MsdsCommandBar = function (props) {
    var items = [];
    if (props.displayMode !== sp_core_library_1.FormDisplayMode.New) {
        items.push({
            key: 'copyto',
            text: 'Copy to',
            iconProps: { iconName: 'Copy' },
            buttonStyles: {
                root: buttonStyles,
                icon: buttonStyles,
            },
            onClick: function () {
                var _a;
                var requests = [
                    lookup_service_1.LookupService.getAllSites(),
                    lookup_service_1.LookupService.getDatabases(props.item.Site),
                    lookup_service_1.LookupService.getAllCustomers(props.item.Database),
                    lookup_service_1.LookupService.getCustomer((_a = props.item.CustomerNameId) !== null && _a !== void 0 ? _a : -1),
                ];
                Promise.all(requests)
                    .then(function (result) {
                    var _a = [
                        result[0],
                        result[1],
                        result[2],
                        result[3],
                    ], sites = _a[0], dbs = _a[1], customers = _a[2], customer = _a[3];
                    var exists = customers.filter(function (c) { return c.Id === props.item.CustomerNameId; }).length > 0;
                    if (!exists) {
                        customers.push(customer);
                    }
                    (0, sp_components_1.showDialog)({
                        id: constants_1.DIALOG_ID,
                        content: (React.createElement(CopyTo_1.CopyTo, { item: props.item, sites: sites, databasesInit: dbs, customersInit: customers, onClose: props.onClose })),
                        dialogProps: {
                            dialogContentProps: {
                                title: 'Copy to',
                            },
                        },
                    });
                })
                    .catch(function (error) {
                    console.log(error);
                });
            },
        });
    }
    return (React.createElement("div", { className: MsdsCommandBar_module_scss_1.default.container },
        React.createElement(react_1.CommandBar, { styles: {
                root: buttonStyles,
            }, items: items })));
};
exports.MsdsCommandBar = MsdsCommandBar;
//# sourceMappingURL=index.js.map