import * as React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IMSDSRequest } from '../services/IMSDSRequest';

function useSingleFieldEffect(
    fieldValue: string | boolean | (string | boolean)[],
    effect: (value: string | boolean | (string | boolean)[]) => void
): void {
    React.useEffect(
        () => {
            effect(fieldValue);
        },
        Array.isArray(fieldValue) ? [...fieldValue] : [fieldValue]
    );
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
    const materialType = watch('MaterialType');
    const forbiddenForBulk = watch('ForbiddenForBulk');
    const siloOperations = watch('SiloOperations');
    const debagOperations = watch('DebaggingOperations');
    const packedOperations = watch('PackedOperations');
	const site = watch('Site');
    console.log(materialType);

    const setValueIfAllowed = React.useMemo(() => {
        if (!isDirty) return (() => null) as typeof setValue;
        return setValue;
    }, [isDirty]);

    useSingleFieldEffect(
        [siloOperations, debagOperations],
        (operations: boolean[]) => {
            const [siloOperations, debagOperations] = operations;
            const fields: (keyof IMSDSRequest)[] = [
                'MeltingPoint',
                'Abrasive',
                'Hygroscopic',
                'ForbiddenMixedSites',
                'DedicatedFlexiblesValves',
            ];
            if (siloOperations === undefined && debagOperations === undefined) {
                return setDisabled((prev) => [...prev, ...fields]);
            }
            if (operations.every((o) => !o)) {
                setDisabled((prev) => [...prev, ...fields]);
                fields.forEach((field) =>
                    setValueIfAllowed(
                        field,
                        typeof watch(field) === 'string' ? '' : false
                    )
                );
            } else {
                setDisabled((prev) => {
                    const exclude = new Set(fields);
                    return prev.filter((val) => !exclude.has(val));
                });
            }
            if (siloOperations === true) {
                if (!productRemarks?.includes(REMARK_SILO_OPERATIONS)) {
                    setValueIfAllowed(
                        'ProductRemarks',
                        `${REMARK_SILO_OPERATIONS}${productRemarks || ''}`
                    );
                }
                if (!siloRemarks?.includes(REMARK_SILO_OPERATIONS)) {
                    setValueIfAllowed(
                        'SiloRemarks',
                        `${REMARK_SILO_OPERATIONS}${siloRemarks || ''}`
                    );
                }
            } else {
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
            }
        }
    );

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

	// Request 03-19-2024 from Dmitri Gusan
	// If site is 'Packaging Material', then:
	// - MaterialType is 'Packaging material'
	// - ProductType is 'PM'
	useSingleFieldEffect(site, (site) => {
		if (typeof site !== 'string') return;
		if (site.toLowerCase() === 'packaging material') {
			setValueIfAllowed('MaterialType', 'Packaging material');
			setValueIfAllowed('ProductType', 'PM');
		}
	});

    // Change 2025-10-10
    // if Material type is <> Packaging material
    // Set "Do you have an SDS" to true
    // otherwise set it to false
    useSingleFieldEffect(materialType, (mT) => {
        if (typeof mT !== 'string') return;
        if (mT.toLowerCase() !== 'packaging material') {
            setValueIfAllowed('HasMsds', true);
        } else {
            setValueIfAllowed('HasMsds', false);
        }
    });
}
