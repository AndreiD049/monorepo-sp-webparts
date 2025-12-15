"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFieldEffects = useFieldEffects;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
function useSingleFieldEffect(fieldValue, effect) {
    React.useEffect(function () {
        effect(fieldValue);
    }, Array.isArray(fieldValue) ? tslib_1.__spreadArray([], fieldValue, true) : [fieldValue]);
}
var REMARK_FORBIDDEN_FOR_BULK = 'DO NOT UNLOAD IN SILO\n';
var REMARK_SILO_OPERATIONS = 'TAKE SAMPLE\n';
function useFieldEffects(watch, isDirty, setValue, setDisabled) {
    var productRemarks = watch('ProductRemarks');
    var siloRemarks = watch('SiloRemarks');
    var materialType = watch('MaterialType');
    var forbiddenForBulk = watch('ForbiddenForBulk');
    var siloOperations = watch('SiloOperations');
    var debagOperations = watch('DebaggingOperations');
    var packedOperations = watch('PackedOperations');
    var site = watch('Site');
    console.log(materialType);
    var setValueIfAllowed = React.useMemo(function () {
        if (!isDirty)
            return (function () { return null; });
        return setValue;
    }, [isDirty]);
    useSingleFieldEffect([siloOperations !== null && siloOperations !== void 0 ? siloOperations : false, debagOperations !== null && debagOperations !== void 0 ? debagOperations : false], function (operations) {
        if (!Array.isArray(operations)) {
            return;
        }
        var siloOperations = operations[0], debagOperations = operations[1];
        var fields = [
            'MeltingPoint',
            'Abrasive',
            'Hygroscopic',
            'ForbiddenMixedSites',
            'DedicatedFlexiblesValves',
        ];
        if (siloOperations === undefined && debagOperations === undefined) {
            return setDisabled(function (prev) { return tslib_1.__spreadArray(tslib_1.__spreadArray([], prev, true), fields, true); });
        }
        if (operations.every(function (o) { return !o; })) {
            setDisabled(function (prev) { return tslib_1.__spreadArray(tslib_1.__spreadArray([], prev, true), fields, true); });
            fields.forEach(function (field) {
                return setValueIfAllowed(field, typeof watch(field) === 'string' ? '' : false);
            });
        }
        else {
            setDisabled(function (prev) {
                var exclude = new Set(fields);
                return prev.filter(function (val) { return !exclude.has(val); });
            });
        }
        if (siloOperations === true) {
            if (!(productRemarks === null || productRemarks === void 0 ? void 0 : productRemarks.includes(REMARK_SILO_OPERATIONS))) {
                setValueIfAllowed('ProductRemarks', "".concat(REMARK_SILO_OPERATIONS).concat(productRemarks || ''));
            }
            if (!(siloRemarks === null || siloRemarks === void 0 ? void 0 : siloRemarks.includes(REMARK_SILO_OPERATIONS))) {
                setValueIfAllowed('SiloRemarks', "".concat(REMARK_SILO_OPERATIONS).concat(siloRemarks || ''));
            }
        }
        else {
            if (productRemarks) {
                setValueIfAllowed('ProductRemarks', "".concat(productRemarks.replace(REMARK_SILO_OPERATIONS, '')));
            }
            if (siloRemarks) {
                setValueIfAllowed('SiloRemarks', "".concat(siloRemarks.replace(REMARK_SILO_OPERATIONS, '')));
            }
        }
    });
    useSingleFieldEffect(forbiddenForBulk !== null && forbiddenForBulk !== void 0 ? forbiddenForBulk : false, function (forbidden) {
        if (forbidden) {
            setValueIfAllowed('SiloOperations', false);
            setValueIfAllowed('BulkDensity', 0);
            setValueIfAllowed('MeasuredBulkDensity', false);
            setValueIfAllowed('ProductRemarks', "".concat(REMARK_FORBIDDEN_FOR_BULK).concat(productRemarks || ''));
            setValueIfAllowed('SiloRemarks', "".concat(REMARK_FORBIDDEN_FOR_BULK).concat(siloRemarks || ''));
            setDisabled(function (prev) { return tslib_1.__spreadArray(tslib_1.__spreadArray([], prev, true), [
                'SiloOperations',
                'BulkDensity',
                'MeasuredBulkDensity',
            ], false); });
        }
        else {
            var exclude_1 = new Set([
                'SiloOperations',
                'BulkDensity',
                'MeasuredBulkDensity',
            ]);
            setDisabled(function (prev) {
                return prev.filter(function (val) { return !exclude_1.has(val); });
            });
            if (forbidden === undefined)
                return;
            if (productRemarks) {
                setValueIfAllowed('ProductRemarks', "".concat(productRemarks.replace(REMARK_FORBIDDEN_FOR_BULK, '')));
            }
            if (siloRemarks) {
                setValueIfAllowed('SiloRemarks', "".concat(siloRemarks.replace(REMARK_FORBIDDEN_FOR_BULK, '')));
            }
        }
    });
    useSingleFieldEffect(packedOperations !== null && packedOperations !== void 0 ? packedOperations : false, function (packed) {
        if (packed === false) {
            setDisabled(function (prev) { return tslib_1.__spreadArray(tslib_1.__spreadArray([], prev, true), ['WarehouseType'], false); });
            if (packed === undefined)
                return;
            setValueIfAllowed('WarehouseType', '');
        }
        else {
            setDisabled(function (prev) {
                return prev.filter(function (val) { return val !== 'WarehouseType'; });
            });
        }
    });
    // Request 03-19-2024 from Dmitri Gusan
    // If site is 'Packaging Material', then:
    // - MaterialType is 'Packaging material'
    // - ProductType is 'PM'
    useSingleFieldEffect(site !== null && site !== void 0 ? site : "", function (site) {
        if (typeof site !== 'string')
            return;
        if (site.toLowerCase() === 'packaging material') {
            setValueIfAllowed('MaterialType', 'Packaging material');
            setValueIfAllowed('ProductType', 'PM');
        }
    });
    // Change 2025-10-10
    // if Material type is <> Packaging material
    // Set "Do you have an SDS" to true
    // otherwise set it to false
    useSingleFieldEffect(materialType !== null && materialType !== void 0 ? materialType : "", function (mT) {
        if (typeof mT !== 'string')
            return;
        if (mT.toLowerCase() !== 'packaging material') {
            setValueIfAllowed('HasMsds', true);
        }
        else {
            setValueIfAllowed('HasMsds', false);
        }
    });
}
//# sourceMappingURL=useFieldEffects.js.map