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
import { ITag } from 'office-ui-fabric-react';
import { useMaterialTypes } from '../hooks/useMaterialTypes';
import { useFormShape } from '../hooks/useFormShape';
import { useColors } from '../hooks/useColor';
import { useWarehouseTypes } from '../hooks/useWarehouseType';
import { useProductTypes } from '../hooks/useProductTypes';
import { MSDSSpinButton } from './MSDSSpinButton';
import { useHazardousGoodsCodes } from '../hooks/useHazardousGoodsCode';
import { Collapsible, handleToggle } from './Collapsible';
import { useForm } from 'react-hook-form';
import { ItemService } from '../services/item-service';
import { Buttons } from './Buttons';
import { MSDSAttachmentsNew } from './MSDSAttachmentsNew';
import { useFields } from '../hooks/useFields';
import {
    Dialog,
    hideSpinner,
    LoadingSpinner,
    showSpinner,
} from 'sp-components';
import styles from './MsdsForm.module.scss';
import { DIALOG_ID, SPINNER_ID } from '../constants';
import { useAttachments } from '../hooks/useAttachments';
import { MsdsAttachmentsDetails } from './MsdsAttachmentsDetails';

export interface IMsdsFormProps {
    context: FormCustomizerContext;
    displayMode: FormDisplayMode;
    onSave: () => void;
    onClose: () => void;
    item?: IMSDSRequest;
    etag?: string;
}

export const MsdsForm: React.FC<IMsdsFormProps> = (props: IMsdsFormProps) => {
    const [collapsedBlocks, setCollapsedBlocks] = React.useState({
        applicant: true,
        approver: props.displayMode === FormDisplayMode.New ? false : true,
    });
    const {
        control,
        handleSubmit,
        watch,
        formState: { dirtyFields },
    } = useForm<Partial<IMSDSRequest & { Attachments: File[] }>>({
        defaultValues: {
            Urgency: 'Medium',
        },
        values: props.item || {},
    });

    const site = watch('Site');
    const field = useFields(site);
    const customers = useCustomers();
    const databases = useDatabases(site);
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
    const attachments = useAttachments(props.item?.Id);

    const handleFilter = React.useCallback(
        async (tags: ITag[], filter: string): Promise<ITag[]> => {
            const filterLower = filter.toLowerCase();
            return tags.filter(
                (tag) => tag.name.toLowerCase().indexOf(filterLower) !== -1
            );
        },
        []
    );

    const CreateOrSave = React.useCallback(
        async (data: Partial<IMSDSRequest & { Attachments: File[] }>) => {
            try {
                showSpinner(SPINNER_ID);
                if (props.displayMode === FormDisplayMode.New) {
                    const addedItem = await ItemService.createItem(data);
                    await ItemService.addAttachments(
                        addedItem.data.Id,
                        data.Attachments
                    );
                    props.onSave();
                } else {
                    const payload: Partial<IMSDSRequest> = {};
                    for (const key in data) {
                        if (Object.prototype.hasOwnProperty.call(data, key)) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const element = (data as any)[key];
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            if ((dirtyFields as any)[key]) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (payload as any)[key] = element;
                            }
                        }
                    }
                    await ItemService.updateItem(props.item.Id, payload);
                    props.onSave();
                }
            } finally {
                hideSpinner(SPINNER_ID);
            }
        },
        [props.onSave, props.displayMode, dirtyFields]
    );

    return (
        <form className={styles.msdsForm} onSubmit={handleSubmit(CreateOrSave)}>
            <LoadingSpinner id={SPINNER_ID} />
            <Dialog id={DIALOG_ID} />
            <div style={{ backgroundColor: '#060808', height: '120px' }}>
                <img src={require('../assets/Header2.png')} height="120px" />
            </div>
            <Collapsible
                headerText="Applicant"
                isOpen={collapsedBlocks.applicant}
                onToggle={() => handleToggle('applicant', setCollapsedBlocks)}
            >
                {/* Row 1 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <div className="width-15p">
                        <MsdsTagPickerField
                            id="Site"
                            label="1. Site"
                            title="Application where SITE can be find"
                            tags={sites.tags}
                            handleFilter={(filter) => {
                                return handleFilter(sites.tags, filter);
                            }}
                            control={control}
                            rules={{ required: 'Site is required' }}
                        />
                    </div>

                    <div className="width-20p">
                        <MsdsTagPickerField
                            id="DatabaseId"
                            label="2.Database"
                            title="Application where SITE can be found"
                            tags={databases.tags}
                            handleFilter={async (filter) => {
                                return handleFilter(databases.tags, filter);
                            }}
                            control={control}
                            rules={{
                                required: 'Database is required',
                                disabled: field.Database === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSCheckbox
                            id="HasMsds"
                            label="3.Do you have an (European) msds? / Not older than 3 years"
                            title="EU format (16 sections - mention of EU norms / guidelines) / Max 3 years old"
                            style={{ maxWidth: '250px' }}
                            control={control}
                            rules={{ disabled: field.HasMsds === 'Disabled' }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSDatePicker
                            id="MSDSDate"
                            label="4.MSDS issued date"
                            title="to be updated"
                            pickerProps={{
                                maxDate: new Date(),
                                allowTextInput: true,
                            }}
                            control={control}
                            rules={{
                                required: 'MSDS Date is required',
                                disabled: field.MSDSDate === 'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 2 */}
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        <MSDSTextField
                            id="CasNo"
                            label="5.MSDS Cas No."
                            title="CAS Registry Number is a unique numerical identifier assigned by Chemical Abstracts Service CAS"
                            control={control}
                            rules={{ disabled: field.CasNo === 'Disabled' }}
                        />
                    </div>

                    <div className="width-20p">
                        <MsdsTagPickerField
                            id="CustomerNameId"
                            label="6.Customer name in Plato"
                            title="to be updated"
                            tags={customers.tags}
                            handleFilter={async (filter) => {
                                const customers =
                                    await LookupService.getCustomerFilter(
                                        filter
                                    );
                                return customers.map((c) => ({
                                    name: c.Title,
                                    key: c.Id,
                                }));
                            }}
                            control={control}
                            rules={{
                                required: 'Customer is required',
                                disabled: field.CustomerName === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSTextField
                            id="ProductName"
                            label="7.Product name to create in Plato"
                            title="if created product name ≠ name on MSDS, confirmation of customer to be attached"
                            control={control}
                            rules={{
                                required: 'Product name is required',
                                disabled: field.ProductName === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MsdsTagPickerField
                            id="MaterialType"
                            label="8.Material type"
                            title="to be updated"
                            tags={materialTypes.tags}
                            handleFilter={async (filter) => {
                                return handleFilter(materialTypes.tags, filter);
                            }}
                            control={control}
                            rules={{
                                required: 'Material type is required',
                                disabled: field.MaterialType === 'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 3 */}
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        <CustomsCodeField
                            id="CustomsCode"
                            label="9.Customs code"
                            title="Important for Customs formalities - NOT on MSDS  - to be confirmed by mail  - MUST ALWAYS be mentioned also in case of no customs : 0000000001"
                            fieldProps={{
                                mask: '9999999999',
                            }}
                            control={control}
                            rules={{
                                required: 'Customs code is required',
                                disabled: field.CustomsCode === 'Disabled',
                                minLength: {
                                    message: 'Customs code should be 10 digits',
                                    value: 10,
                                },
                                maxLength: {
                                    message: 'Customs code should be 10 digits',
                                    value: 10,
                                },
                            }}
                        />
                    </div>

                    <div className="width-20p">
                        <MsdsTagPickerField
                            id="FormShape"
                            label="10.Form / Shape"
                            title="to be updated"
                            tags={formShapes.tags}
                            handleFilter={async (filter) =>
                                handleFilter(formShapes.tags, filter)
                            }
                            control={control}
                            rules={{
                                required: 'Form or shape is required',
                                disabled: field.FormShape === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MsdsTagPickerField
                            id="Color"
                            label="11.What is the color of the product?"
                            title="Do not accept 'various colors'  -  'unknown'  -  'opal white' / If a color has been confirmed by customer on msds or mail, attach this here"
                            tags={colors.tags}
                            handleFilter={async (filter) =>
                                handleFilter(colors.tags, filter)
                            }
                            control={control}
                            rules={{
                                required: 'Color is required',
                                disabled: field.Color === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSCheckbox
                            id="PackedOperations"
                            label="12.PACKED OPERATIONS NEEDED?"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled: field.PackedOperations === 'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 4 */}
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        <MsdsTagPickerField
                            id="WarehouseType"
                            label="13.Warehouse Type"
                            title="Extra customer specific requirements.  For instance for WH : f.i. heated or cold storage, …"
                            tags={whtypes.tags}
                            handleFilter={async (filter) =>
                                handleFilter(whtypes.tags, filter)
                            }
                            control={control}
                            rules={{
                                disabled: field.WarehouseType === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-20p">
                        <MSDSCheckbox
                            id="DebaggingOperations"
                            label="14.DEBAGGING OPERATIONS NEEDED?"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled:
                                    field.DebaggingOperations === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSCheckbox
                            id="SiloOperations"
                            label="15.SILO OPERATION OPERATION NEEDED?"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled: field.SiloOperations === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSTextField
                            id="MeltingPoint"
                            label="16.Melting point? °C"
                            title="to be updated"
                            fieldProps={{
                                suffix: '°C',
                                type: 'number',
                                autoComplete: 'off',
                            }}
                            control={control}
                            rules={{
                                min: {
                                    message: 'Melting point cannot be negative',
                                    value: 0,
                                },
                                disabled: field.MeltingPoint === 'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 4 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <div className="width-15p">
                        <MSDSCheckbox
                            id="Abrasive"
                            label="17.Abrasive? Filled with short glass fiber"
                            title="Glass filled granulate is an information that is normally mentioned."
                            control={control}
                            rules={{ disabled: field.Abrasive === 'Disabled' }}
                        />
                    </div>

                    <div className="width-20p">
                        <MSDSCheckbox
                            id="Hygroscopic"
                            label="18.Hygroscopic? Tending to absorb moisture, water from air."
                            title="Not always clear on MSDS, to be confirmed by customer!  Aluminium bags or liner is an indication.  Section 7"
                            control={control}
                            rules={{
                                disabled: field.Hygroscopic === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSCheckbox
                            id="ForbiddenMixedSites"
                            label="19.Forbidden mixed production site in silo?"
                            title="Default = YES No mix of same producttype produced at different plants may be mixed. "
                            control={control}
                            rules={{
                                disabled:
                                    field.ForbiddenMixedSites === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSTextField
                            id="DedicatedFlexiblesValves"
                            label="20.Dedicated Flexible(s)? Rotary Valve(s)?"
                            title="Operational or customer service knowledge for dedicated equipment if any"
                            style={{ width: '200px' }}
                            fieldProps={{
                                multiline: true,
                                autoAdjustHeight: true,
                            }}
                            control={control}
                            rules={{
                                disabled:
                                    field.DedicatedFlexiblesValves ===
                                    'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 4 */}
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        <MSDSTextField
                            id="DescriptionOnLabel"
                            label="21.Description on label?"
                            title="In case a customer requires a specific mark or sign on the labels.  F.i. DUPONT requires  ®"
                            control={control}
                            rules={{
                                disabled:
                                    field.DescriptionOnLabel === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-20p">
                        <MsdsTagPickerField
                            id="Urgency"
                            label="22.Urgency"
                            title="to be updated"
                            tags={urgencyTags}
                            handleFilter={async (filter) =>
                                handleFilter(urgencyTags, filter)
                            }
                            control={control}
                            rules={{
                                required: 'Urgency is required',
                                disabled: field.Urgency === 'Disabled',
                            }}
                        />
                    </div>
                </div>
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        {props.displayMode === FormDisplayMode.New ? (
                            <MSDSAttachmentsNew
                                id="Attachments"
                                label="23.Attachments"
                                title="to be updated"
                                control={control}
                                rules={{ required: 'Attachments are required' }}
                            />
                        ) : (
                            <MsdsAttachmentsDetails
                                id="Attachments"
                                label="23.Attachments"
                                title="to be updated"
                                displayMode={props.displayMode}
                                attachments={attachments}
                                required
                                itemId={props.item.Id}
                            />
                        )}
                    </div>
                </div>
            </Collapsible>

            {/* Approver */}
            <Collapsible
                headerText="HSEQ Approver"
                isOpen={collapsedBlocks.approver}
                onToggle={() => handleToggle('approver', setCollapsedBlocks)}
            >
                {/* Row 1 */}
                <div className={`${styles.msdsRow} ${styles.msdsGap1}`}>
                    <div className="width-15p">
                        <MSDSCheckbox
                            id="StorageManipApproved"
                            label="1.Storage and manipulation of the product allowed"
                            title="Check if product can be stored according your permit (f.i. amount of dangerous goods)."
                            control={control}
                            rules={{
                                disabled:
                                    field.StorageManipApproved === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-20p">
                        <MsdsTagPickerField
                            id="ProductType"
                            label="2.Product type"
                            title="to be updated"
                            tags={productTypes.tags}
                            handleFilter={async (filter) =>
                                handleFilter(productTypes.tags, filter)
                            }
                            control={control}
                            rules={{
                                disabled: field.ProductType === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSCheckbox
                            id="ForbiddenForBulk"
                            label="3.Forbidden for bulk?"
                            title="See product type forbidden = Emulsion PVC, rubber,… / Melting point <50°C / …"
                            control={control}
                            rules={{
                                disabled: field.ForbiddenForBulk === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSSpinButton
                            id="BulkDensity"
                            label="4.Bulk density Plato"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled: field.BulkDensity === 'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 2 */}
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        <MSDSCheckbox
                            id="ManipNotAllowed"
                            label="5.Manipulation (change) not allowed?"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled: field.ManipNotAllowed === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-20p">
                        <MSDSTextField
                            id="ProductRemarks"
                            label="6.Product remarks"
                            title="f.i.Glassfilled product."
                            fieldProps={{
                                multiline: true,
                                autoAdjustHeight: true,
                            }}
                            control={control}
                            rules={{
                                disabled: field.ProductRemarks === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSTextField
                            id="SafetyRemarks"
                            label="7.SAFETY REMARKS Printed on each order."
                            title="F.i. Fire fighting equipment, storage & handling conditions, dust explosion => earthing"
                            fieldProps={{
                                multiline: true,
                                autoAdjustHeight: true,
                            }}
                            control={control}
                            rules={{
                                disabled: field.SafetyRemarks === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSTextField
                            id="SiloRemarks"
                            label="8.REMARKS SILO operations"
                            title="F.i. sticky product  (stick potentials) may not be stored in silos in the outer rows of the silo battery."
                            fieldProps={{
                                multiline: true,
                                autoAdjustHeight: true,
                            }}
                            control={control}
                            rules={{
                                disabled: field.SiloRemarks === 'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 3 */}
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        <MsdsTagPickerField
                            id="HazardousGoods"
                            label="9.HAZARDOUS GOODS products code"
                            title="Check section 2 of MSDS pdf"
                            tags={hazardousGoodsCodes.tags}
                            handleFilter={async (filter) =>
                                handleFilter(hazardousGoodsCodes.tags, filter)
                            }
                            control={control}
                            rules={{
                                disabled: field.HazardousGoods === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-20p">
                        <MSDSCheckbox
                            id="DustCategory"
                            label="10.Dust category"
                            title="If shape FLUFF/Powder check dust category(For Approver)"
                            control={control}
                            rules={{
                                disabled: field.DustCategory === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSCheckbox
                            id="NitrogenCoverage"
                            label="11.Nitrogen coverage"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled: field.NitrogenCoverage === 'Disabled',
                            }}
                        />
                    </div>

                    <div className="width-15p">
                        <MSDSCheckbox
                            id="ClientRequirementsFnF"
                            label="12.Client requirements on food & feed (GMP) regulations?"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled:
                                    field.ClientRequirementsFnF === 'Disabled',
                            }}
                        />
                    </div>
                </div>

                {/* Row 4 */}
                <div
                    className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                >
                    <div className="width-15p">
                        <MSDSTextField
                            id="MOC"
                            label="13.MOC Management of change"
                            title="CONSULTATION + INFORMATION when changing product, operation or conditions mark  + forward this form"
                            fieldProps={{
                                multiline: true,
                                autoAdjustHeight: true,
                            }}
                            control={control}
                            rules={{ disabled: field.MOC === 'Disabled' }}
                        />
                    </div>

                    <div className="width-20p">
                        <MSDSCheckbox
                            id="ExtraCheckNeeded"
                            label="14.Extra check needed by quality in Plato ? Approver product will activate PM in Plato!"
                            title="to be updated"
                            control={control}
                            rules={{
                                disabled: field.ExtraCheckNeeded === 'Disabled',
                            }}
                        />
                    </div>
                </div>
            </Collapsible>

            <Buttons
                displayMode={props.displayMode}
                onClose={props.onClose}
                onSave={props.onSave}
            />
        </form>
    );
};
