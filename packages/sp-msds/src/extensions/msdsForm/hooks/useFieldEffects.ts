import * as React from 'react';
import {
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import { IMSDSRequest } from '../services/IMSDSRequest';

function useSingleFieldEffect(
    fieldValue: string | boolean,
    effect: (value: string | boolean) => void
): void {
    React.useEffect(() => {
        effect(fieldValue);
    }, [fieldValue]);
}

type FormValues = Partial<IMSDSRequest & { Attachments: File[] }>;

const REMARK_FORBIDDEN_FOR_BULK = 'DO NOT UNLOAD IN SILO\n';
const REMARK_SILO_OPERATIONS = 'TAKE SAMPLE\n';

export function useFieldEffects(
    watch: UseFormWatch<FormValues>,
    isDirty: boolean,
    setValue: UseFormSetValue<FormValues>,
    setDisabled: React.Dispatch<React.SetStateAction<(keyof IMSDSRequest)[]>>
): void {
    const productRemarks = watch('ProductRemarks');
    const siloRemarks = watch('SiloRemarks');
    const forbiddenForBulk = watch('ForbiddenForBulk');
    const siloOperations = watch('SiloOperations');
    const packedOperations = watch('PackedOperations');

    const setValueIfAllowed = React.useMemo(() => {
        if (!isDirty) return (() => null) as typeof setValue;
        return setValue;
    }, [isDirty]);

    useSingleFieldEffect(siloOperations, (siloOperations) => {
        const fields: (keyof IMSDSRequest)[] = [
            'MeltingPoint',
            'Abrasive',
            'Hygroscopic',
            'ForbiddenMixedSites',
            'DedicatedFlexiblesValves',
        ];
        if (!siloOperations) {
            setDisabled((prev) => [...prev, ...fields]);
            if (siloOperations === undefined) return;
                fields.forEach((field) =>
                    setValueIfAllowed(
                        field,
                        typeof watch(field) === 'string' ? '' : false
                    )
                );
                if (productRemarks) {
                    setValueIfAllowed(
                        'ProductRemarks',
                        `${productRemarks.replace(REMARK_SILO_OPERATIONS, '')}`
                    );
                }
                if (siloRemarks) {
                    setValueIfAllowed(
                        'SiloRemarks',
                        `${siloRemarks.replace(REMARK_SILO_OPERATIONS, '')}`
                    );
                }
        } else {
            setDisabled((prev) => {
                const exclude = new Set(fields);
                return prev.filter((val) => !exclude.has(val));
            });
                setValueIfAllowed(
                    'ProductRemarks',
                    `${REMARK_SILO_OPERATIONS}${productRemarks || ''}`
                );
                setValueIfAllowed(
                    'SiloRemarks',
                    `${REMARK_SILO_OPERATIONS}${siloRemarks || ''}`
                );
        }
    });

    useSingleFieldEffect(forbiddenForBulk, (forbidden) => {
        if (forbidden) {
                setValueIfAllowed('SiloOperations', false);
                setValueIfAllowed('BulkDensity', 0);
                setValueIfAllowed('MeasuredBulkDensity', false);
                setValueIfAllowed(
                    'ProductRemarks',
                    `${REMARK_FORBIDDEN_FOR_BULK}${productRemarks || ''}`
                );
                setValueIfAllowed(
                    'SiloRemarks',
                    `${REMARK_FORBIDDEN_FOR_BULK}${siloRemarks || ''}`
                );
            setDisabled((prev) => [
                ...prev,
                'SiloOperations',
                'BulkDensity',
                'MeasuredBulkDensity',
            ]);
        } else {
            const exclude = new Set([
                'SiloOperations',
                'BulkDensity',
                'MeasuredBulkDensity',
            ]);
            setDisabled((prev) => {
                return prev.filter((val) => !exclude.has(val));
            });
            if (forbidden === undefined) return;
            if (productRemarks) {
                setValueIfAllowed(
                    'ProductRemarks',
                    `${productRemarks.replace(REMARK_FORBIDDEN_FOR_BULK, '')}`
                );
            }
            if (siloRemarks) {
                setValueIfAllowed(
                    'SiloRemarks',
                    `${siloRemarks.replace(REMARK_FORBIDDEN_FOR_BULK, '')}`
                );
            }
        }
    });

    useSingleFieldEffect(packedOperations, (packed) => {
        if (packed === false) {
            setDisabled((prev) => [...prev, 'WarehouseType']);
            if (packed === undefined) return;
            setValueIfAllowed('WarehouseType', '');
        } else {
            setDisabled((prev) => {
                return prev.filter((val) => val !== 'WarehouseType');
            });
        }
    });
}