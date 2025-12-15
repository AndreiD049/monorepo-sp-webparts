"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFields = useFields;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var field_service_1 = require("../services/field-service");
function useFields(site) {
    var _a = React.useState([]), fields = _a[0], setFields = _a[1];
    React.useEffect(function () {
        if (site) {
            field_service_1.FieldService.getFields(site).then(function (value) { return setFields(value); }).catch(function (err) { return console.error(err); });
        }
    }, [site]);
    return fields.length > 0 ? fields[0] : {};
}
//# sourceMappingURL=useFields.js.map