import * as React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
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
    setValue: UseFormSetValue<FormValues>,
    setDisabled: React.Dispatch<React.SetStateAction<(keyof IMSDSRequest)[]>>
): void {
    const productRemarks = watch('ProductRemarks');
    const siloRemarks = watch('SiloRemarks');
    const forbiddenForBulk = watch('ForbiddenForBulk');
    const siloOperations = watch('SiloOperations');
    const packedOperations = watch('PackedOperations');

    useSingleFieldEffect(siloOperations, (oper) => {
        const fields: (keyof IMSDSRequest)[] = [
            'MeltingPoint',
            'Abrasive',
            'Hygroscopic',
            'ForbiddenMixedSites',
            'DedicatedFlexiblesValves',
        ];
        if (oper === undefined) return;
        if (!oper) {
            setDisabled((prev) => [...prev, ...fields]);
            fields.forEach((field) =>
                setValue(field, typeof watch(field) === 'string' ? '' : false)
            );
            if (productRemarks) {
                setValue(
                    'ProductRemarks',
                    `${productRemarks.replace(REMARK_SILO_OPERATIONS, '')}`
                );
            }
            if (siloRemarks) {
                setValue(
                    'SiloRemarks',
                    `${siloRemarks.replace(REMARK_SILO_OPERATIONS, '')}`
                );
            }
        } else {
            setDisabled((prev) => {
                const exclude = new Set(fields);
                return prev.filter((val) => !exclude.has(val));
            });
            setValue(
                'ProductRemarks',
                `${REMARK_SILO_OPERATIONS}${productRemarks || ''}`
            );
            setValue(
                'SiloRemarks',
                `${REMARK_SILO_OPERATIONS}${siloRemarks || ''}`
            );
        }
    });

    useSingleFieldEffect(forbiddenForBulk, (forbidden) => {
        if (forbidden === undefined) return;
        if (forbidden) {
            setValue('SiloOperations', false);
            setValue('BulkDensity', 0);
            setValue('MeasuredBulkDensity', false);
            setValue(
                'ProductRemarks',
                `${REMARK_FORBIDDEN_FOR_BULK}${productRemarks || ''}`
            );
            setValue(
                'SiloRemarks',
                `${REMARK_FORBIDDEN_FOR_BULK}${siloRemarks || ''}`
            );
            setDisabled((prev) => [...prev, 'SiloOperations', 'BulkDensity', 'MeasuredBulkDensity']);
        } else {
            const exclude = new Set(['SiloOperations', 'BulkDensity', 'MeasuredBulkDensity']);
            setDisabled((prev) => {
                return prev.filter((val) => !exclude.has(val));
            });
            if (productRemarks) {
                setValue(
                    'ProductRemarks',
                    `${productRemarks.replace(REMARK_FORBIDDEN_FOR_BULK, '')}`
                );
            }
            if (siloRemarks) {
                setValue(
                    'SiloRemarks',
                    `${siloRemarks.replace(REMARK_FORBIDDEN_FOR_BULK, '')}`
                );
            }
        }
    });

    useSingleFieldEffect(packedOperations, (packed) => {
        if (packed === undefined) return;
        if (packed === false) {
            setDisabled((prev) => [...prev, 'WarehouseType']);
            setValue('WarehouseType', '');
        } else {
            setDisabled((prev) => {
                return prev.filter((val) => val !== 'WarehouseType');
            });
        }
    });
}
