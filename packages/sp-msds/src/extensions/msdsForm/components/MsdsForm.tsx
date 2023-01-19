import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import { MSDSCheckbox } from './MSDSCheckbox';
import { MSDSDatePicker } from './MSDSDatePicker';
import { MSDSTextField } from './MSDSTextField';
import { CustomsCodeField } from './CustomsCodeField';
import { LookupService } from '../services/lookup-service';
import { MsdsTagPickerField } from './MsdsTagPickerField';
import { useCustomers } from '../hooks/useCustomers';
import { useDatabases } from '../hooks/useDatabases';
import { useSites } from '../hooks/useSites';
import { IMSDSRequest } from '../services/IMSDSRequest';
import {
    DefaultButton,
    ITag,
    PrimaryButton,
    Separator,
    Text,
} from 'office-ui-fabric-react';
import { useMaterialTypes } from '../hooks/useMaterialTypes';
import { useFormShape } from '../hooks/useFormShape';
import { useColors } from '../hooks/useColor';
import { useWarehouseTypes } from '../hooks/useWarehouseType';
import { useProductTypes } from '../hooks/useProductTypes';
import { MSDSSpinButton } from './MSDSSpinButton';
import { useHazardousGoodsCodes } from '../hooks/useHazardousGoodsCode';
import styles from './MsdsForm.module.scss';
import { ItemService } from '../services/item-service';
import { formatDate } from '../utils';

export interface IMsdsFormProps {
    context: FormCustomizerContext;
    displayMode: FormDisplayMode;
    onSave: () => void;
    onClose: () => void;
}

export const MsdsForm: React.FC<IMsdsFormProps> = (props: IMsdsFormProps) => {
    const [data, setData] = React.useState<Partial<IMSDSRequest>>({});

    const customers = useCustomers();
    const databases = useDatabases(data.Site);
    const sites = useSites();
    const materialTypes = useMaterialTypes();
    const formShapes = useFormShape();
    const colors = useColors();
    const whtypes = useWarehouseTypes();
    const urgencyTags: ITag[] = ['Low', 'Medium', 'High'].map((u) => ({
        key: u,
        name: u,
    }));
    const productTypes = useProductTypes();
    const hazardousGoodsCodes = useHazardousGoodsCodes();

    const handleSelectedTag = React.useCallback(
        (field: keyof IMSDSRequest, getter?: (val: ITag) => string | number) => (selected: ITag) => {
            const value = getter ? getter(selected) : selected.name;
            setData((prev) => ({
                ...prev,
                [field]: selected ? value : null,
            }));
        },
        []
    );

    const handleTextInput = React.useCallback(
        (field: keyof IMSDSRequest) => (value: string) => {
            setData((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    const handleFilter = React.useCallback(
        async (tags: ITag[], filter: string): Promise<ITag[]> => {
            const filterLower = filter.toLowerCase();
            return tags.filter(
                (tag) => tag.name.toLowerCase().indexOf(filterLower) !== -1
            );
        },
        []
    );

    const handleCheck = React.useCallback(
        (field: keyof IMSDSRequest) => (checked: boolean) => {
            setData((prev) => ({
                ...prev,
                [field]: checked,
            }));
        },
        []
    );

    const buttons = React.useMemo(() => {
        console.log('update data');
        switch (props.displayMode) {
            case FormDisplayMode.New:
                return (
                    <div className={styles.msdsFormButtons}>
                        <PrimaryButton
                            onClick={async () => {
                                await ItemService.createItem(data);
                                props.onSave();
                            }}
                        >
                            Create
                        </PrimaryButton>
                        <DefaultButton onClick={() => props.onClose()}>
                            Close
                        </DefaultButton>
                    </div>
                );
            case FormDisplayMode.Display:
            case FormDisplayMode.Edit:
                return (
                    <div className={styles.msdsFormButtons}>
                        <PrimaryButton onClick={() => props.onSave()}>
                            Save
                        </PrimaryButton>
                        <DefaultButton onClick={() => props.onClose()}>
                            Close
                        </DefaultButton>
                    </div>
                );
            default:
                return null;
        }
    }, [props.displayMode, data]);

    console.log(data);

    return (
        <div className={styles.msdsForm}>
            <div>
                <Text className={styles.headerText} block variant="xLargePlus">
                    Applicant
                </Text>
                {/* Row 1 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MsdsTagPickerField
                        id="sites"
                        label="1. Site"
                        title="Application where SITE can be find"
                        tags={sites.tags}
                        handleFilter={(filter) => {
                            return handleFilter(sites.tags, filter);
                        }}
                        selectedTag={data.Site}
                        handleSelected={handleSelectedTag('Site')}
                        style={{ width: '200px' }}
                        required
                    />

                    <MsdsTagPickerField
                        id="database"
                        label="2.Database"
                        title="Application where SITE can be found"
                        tags={databases.tags}
                        handleFilter={async (filter) => {
                            return handleFilter(databases.tags, filter);
                        }}
                        selectedTag={data.Database}
                        handleSelected={handleSelectedTag('Database')}
                        style={{ width: '220px' }}
                        required
                    />

                    <MSDSCheckbox
                        id="msds"
                        label="3.Do you have an (European) msds? / Not older than 2 years"
                        title="EU format (16 sections - mention of EU norms / guidelines) / Max 2 years old"
                        style={{ maxWidth: '250px' }}
                        checked={data.HasMsds}
                        onChange={handleCheck('HasMsds')}
                    />

                    <MSDSDatePicker
                        id="msdsDate"
                        label="4.MSDS issued date"
                        title="to be updated"
                        pickerProps={{
                            maxDate: new Date(),
                            allowTextInput: true,
                        }}
                        style={{ width: '200px' }}
                        value={data.MSDSDate ? new Date(data.MSDSDate) : null}
                        onDateSelect={(date) =>
                            setData((prev) => ({
                                ...prev,
                                MSDSDate: formatDate(date),
                            }))
                        }
                    />
                </div>
                <Separator />
                {/* Row 2 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MSDSTextField
                        id="msdsCasNo"
                        label="5.MSDS Cas No."
                        title="CAS Registry Number is a unique numerical identifier assigned by Chemical Abstracts Service CAS"
                        style={{ width: '200px' }}
                        value={data.CasNo}
                        fieldProps={{
                            onChange: (_ev, value) =>
                                handleTextInput('CasNo')(value),
                        }}
                    />

                    <MsdsTagPickerField
                        id="customer"
                        label="6.Customer name in Plato"
                        title="to be updated"
                        tags={customers.tags}
                        handleFilter={async (filter) => {
                            const customers =
                                await LookupService.getCustomerFilter(filter);
                            return customers.map((c) => ({
                                name: c.Title,
                                key: c.Title,
                            }));
                        }}
                        selectedTag={data.CustomerName}
                        handleSelected={(selected) => {
                            handleSelectedTag('CustomerNameId', (tag) => +tag.key)(selected);
                            handleSelectedTag('CustomerName')(selected);
                        }}
                        style={{ width: '220px' }}
                    />

                    <MSDSTextField
                        id="productName"
                        label="7.Product name to create in Plato"
                        title="if created product name ≠ name on MSDS, confirmation of customer to be attached"
                        style={{ width: '250px' }}
                        value={data.ProductName}
                        fieldProps={{
                            onChange: (_ev, value) =>
                                handleTextInput('ProductName')(value),
                        }}
                    />

                    <MsdsTagPickerField
                        id="materialType"
                        label="8.Material type"
                        title="to be updated"
                        tags={materialTypes.tags}
                        handleFilter={async (filter) => {
                            return handleFilter(materialTypes.tags, filter);
                        }}
                        selectedTag={data.MaterialType}
                        handleSelected={handleSelectedTag('MaterialType')}
                        style={{ width: '200px' }}
                    />
                </div>
                <Separator />
                {/* Row 3 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <CustomsCodeField
                        id="customsCode"
                        label="9.Customs code"
                        title="Important for Customs formalities - NOT on MSDS  - to be confirmed by mail  - MUST ALWAYS be mentioned also in case of no customs : 0000000001"
                        value={data.CustomsCode}
                        fieldProps={{
                            mask: '9999999999',
                            minLength: 10,
                            maxLength: 10,
                            onChange: (_ev, value) =>
                                handleTextInput('CustomsCode')(value),
                        }}
                        style={{ width: '200px' }}
                    />

                    <MsdsTagPickerField
                        id="formShape"
                        label="10.Form / Shape"
                        title="to be updated"
                        tags={formShapes.tags}
                        handleFilter={async (filter) =>
                            handleFilter(formShapes.tags, filter)
                        }
                        selectedTag={data.FormShape}
                        handleSelected={handleSelectedTag('FormShape')}
                        style={{ width: '220px' }}
                    />

                    <MsdsTagPickerField
                        id="color"
                        label="11.What is the color of the product?"
                        title="Do not accept 'various colors'  -  'unknown'  -  'opal white' / If a color has been confirmed by customer on msds or mail, attach this here"
                        tags={colors.tags}
                        handleFilter={async (filter) =>
                            handleFilter(colors.tags, filter)
                        }
                        selectedTag={data.Color}
                        handleSelected={handleSelectedTag('Color')}
                        style={{ width: '250px' }}
                    />

                    <MSDSCheckbox
                        id="packedOperations"
                        label="12.PACKED OPERATIONS NEEDED?"
                        title="to be updated"
                        style={{ width: '200px' }}
                        checked={data.PackedOperations}
                        onChange={handleCheck('PackedOperations')}
                    />
                </div>
                <Separator />
                {/* Row 4 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MsdsTagPickerField
                        id="whtype"
                        label="13.Warehouse Type"
                        title="Extra customer specific requirements.  For instance for WH : f.i. heated or cold storage, …"
                        tags={whtypes.tags}
                        handleFilter={async (filter) =>
                            handleFilter(whtypes.tags, filter)
                        }
                        selectedTag={data.WarehouseType}
                        handleSelected={handleSelectedTag('WarehouseType')}
                        style={{ width: '200px' }}
                    />

                    <MSDSCheckbox
                        id="debaggingOperations"
                        label="14.DEBAGGING OPERATIONS NEEDED?"
                        title="to be updated"
                        style={{ width: '220px' }}
                        checked={data.DebaggingOperations}
                        onChange={handleCheck('DebaggingOperations')}
                    />

                    <MSDSCheckbox
                        id="siloOperations"
                        label="15.SILO OPERATION OPERATION NEEDED?"
                        title="to be updated"
                        style={{ width: '250px' }}
                        checked={data.SiloOperations}
                        onChange={handleCheck('SiloOperations')}
                    />

                    <MSDSTextField
                        id="meltingPoint"
                        label="16.Melting point? °C"
                        title="to be updated"
                        style={{ width: '200px' }}
                        value={data.MeltingPoint}
                        fieldProps={{
                            onChange: (_ev, value) =>
                                handleTextInput('MeltingPoint')(value),
                        }}
                    />
                </div>

                <Separator />
                {/* Row 4 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MSDSCheckbox
                        id="abrasive"
                        label="17.Abrasive? Filled with short glass fiber"
                        title="Glass filled granulate is an information that is normally mentioned."
                        style={{ width: '200px' }}
                        checked={data.Abrasive}
                        onChange={handleCheck('Abrasive')}
                    />

                    <MSDSCheckbox
                        id="hygroscopic"
                        label="18.Hygroscopic? Tending to absorb moisture, water from air."
                        title="Not always clear on MSDS, to be confirmed by customer!  Aluminium bags or liner is an indication.  Section 7"
                        style={{ width: '220px' }}
                        checked={data.Hygroscopic}
                        onChange={handleCheck('Hygroscopic')}
                    />

                    <MSDSCheckbox
                        id="forbiddenMixedProd"
                        label="19.Forbidden mixed production site in silo?"
                        title="Default = YES No mix of same producttype produced at different plants may be mixed. "
                        style={{ width: '250px' }}
                        checked={data.ForbiddenMixedSites}
                        onChange={handleCheck('ForbiddenMixedSites')}
                    />

                    <MSDSTextField
                        id="dedicatedFlexible"
                        label="20.Dedicated Flexible(s)? Rotary Valve(s)?"
                        title="Operational or customer service knowledge for dedicated equipment if any"
                        style={{ width: '200px' }}
                        value={data.DedicatedFlexiblesValves}
                        fieldProps={{
                            multiline: true,
                            autoAdjustHeight: true,
                            onChange: (_ev, value) =>
                                handleTextInput('DedicatedFlexiblesValves')(
                                    value
                                ),
                        }}
                    />
                </div>

                <Separator />
                {/* Row 4 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MSDSTextField
                        id="descriptionOnLabel"
                        label="21.Description on label?"
                        title="In case a customer requires a specific mark or sign on the labels.  F.i. DUPONT requires  ®"
                        style={{ width: '200px' }}
                        value={data.DescriptionOnLabel}
                        fieldProps={{
                            onChange: (_ev, value) =>
                                handleTextInput('DescriptionOnLabel')(value),
                        }}
                    />

                    <MsdsTagPickerField
                        id="urgency"
                        label="22.Urgency"
                        title="to be updated"
                        tags={urgencyTags}
                        handleFilter={async (filter) =>
                            handleFilter(urgencyTags, filter)
                        }
                        selectedTag={data.Urgency}
                        handleSelected={handleSelectedTag('Urgency')}
                        style={{ width: '220px' }}
                    />
                </div>
            </div>

            <div>
                <Text className={styles.headerText} block variant="xLargePlus">
                    HSEQ Approver
                </Text>

                {/* Row 1 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MSDSCheckbox
                        id="storageAndManipAllowed"
                        label="1.Storage and manipulation of the product allowed"
                        title="Check if product can be stored according your permit (f.i. amount of dangerous goods)."
                        style={{ maxWidth: '200px' }}
                        checked={data.StorageManipApproved}
                        onChange={handleCheck('StorageManipApproved')}
                    />

                    <MsdsTagPickerField
                        id="productTypes"
                        label="2.Product type"
                        title="to be updated"
                        tags={productTypes.tags}
                        handleFilter={async (filter) =>
                            handleFilter(productTypes.tags, filter)
                        }
                        selectedTag={data.ProductType}
                        handleSelected={handleSelectedTag('ProductType')}
                        style={{ width: '220px' }}
                    />

                    <MSDSCheckbox
                        id="forbiddenForBulk"
                        label="3.Forbidden for bulk?"
                        title="See product type forbidden = Emulsion PVC, rubber,… / Melting point <50°C / …"
                        style={{ width: '250px' }}
                        checked={data.ForbidenForBulk}
                        onChange={handleCheck('ForbidenForBulk')}
                    />

                    <MSDSSpinButton
                        id="bulkDensity"
                        label="4.Bulk density Plato"
                        title="to be updated"
                        style={{ width: '200px' }}
                    />
                </div>

                <Separator />
                {/* Row 2 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MSDSCheckbox
                        id="manipNotAllowed"
                        label="5.Manipulation (change) not allowed?"
                        title="to be updated"
                        style={{ width: '200px' }}
                        checked={data.ManipNotAllowed}
                        onChange={handleCheck('ManipNotAllowed')}
                    />

                    <MSDSTextField
                        id="productRemarks"
                        label="6.Product remarks"
                        title="f.i.Glassfilled product."
                        style={{ width: '220px' }}
                        value={data.ProductRemarks}
                        fieldProps={{
                            multiline: true,
                            autoAdjustHeight: true,
                            onChange: (_ev, value) =>
                                handleTextInput('ProductRemarks')(value),
                        }}
                    />

                    <MSDSTextField
                        id="safetyRemarks"
                        label="7.SAFETY REMARKS Printed on each order."
                        title="F.i. Fire fighting equipment, storage & handling conditions, dust explosion => earthing"
                        style={{ width: '250px' }}
                        value={data.SafetyRemarks}
                        fieldProps={{
                            multiline: true,
                            autoAdjustHeight: true,
                            onChange: (_ev, value) =>
                                handleTextInput('SafetyRemarks')(value),
                        }}
                    />

                    <MSDSTextField
                        id="siloRemarks"
                        label="8.REMARKS SILO operations"
                        title="F.i. sticky product  (stick potentials) may not be stored in silos in the outer rows of the silo battery."
                        style={{ width: '200px' }}
                        value={data.SiloRemarks}
                        fieldProps={{
                            multiline: true,
                            autoAdjustHeight: true,
                            onChange: (_ev, value) =>
                                handleTextInput('SiloRemarks')(value),
                        }}
                    />
                </div>

                <Separator />
                {/* Row 3 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MsdsTagPickerField
                        id="hazardousGoods"
                        label="9.HAZARDOUS GOODS products code"
                        title="Check section 2 of MSDS pdf"
                        tags={hazardousGoodsCodes.tags}
                        handleFilter={async (filter) =>
                            handleFilter(hazardousGoodsCodes.tags, filter)
                        }
                        selectedTag={data.HazardousGoods}
                        handleSelected={handleSelectedTag('HazardousGoods')}
                        style={{ width: '200px' }}
                    />

                    <MSDSCheckbox
                        id="dustCategory"
                        label="10.Dust category"
                        title="If shape FLUFF/Powder check dust category(For Approver)"
                        style={{ width: '220px' }}
                        checked={data.DustCategory}
                        onChange={handleCheck('DustCategory')}
                    />

                    <MSDSCheckbox
                        id="nitrogenCoverage"
                        label="11.Nitrogen coverage"
                        title="to be updated"
                        style={{ width: '250px' }}
                        checked={data.NitrogenCoverage}
                        onChange={handleCheck('NitrogenCoverage')}
                    />

                    <MSDSCheckbox
                        id="clientRequirementsFnF"
                        label="12.Client requirements on food & feed (GMP) regulations?"
                        title="to be updated"
                        style={{ width: '200px' }}
                        checked={data.ClientRequirementsFnF}
                        onChange={handleCheck('ClientRequirementsFnF')}
                    />
                </div>

                <Separator />
                {/* Row 4 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <MSDSTextField
                        id="moc"
                        label="13.MOC Management of change"
                        title="CONSULTATION + INFORMATION when changing product, operation or conditions mark  + forward this form"
                        style={{ width: '200px' }}
                        value={data.MOC}
                        fieldProps={{
                            multiline: true,
                            autoAdjustHeight: true,
                            onChange: (_ev, value) =>
                                handleTextInput('MOC')(value),
                        }}
                    />

                    <MSDSCheckbox
                        id="extraCheck"
                        label="14.Extra check needed by quality in Plato ? Approver product will activate PM in Plato!"
                        title="to be updated"
                        style={{ width: '220px' }}
                        checked={data.ExtraCheckNeeded}
                        onChange={handleCheck('ExtraCheckNeeded')}
                    />
                </div>
            </div>

            {buttons}
        </div>
    );
};
