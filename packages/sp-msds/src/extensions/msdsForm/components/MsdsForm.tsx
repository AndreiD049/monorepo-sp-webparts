import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';
import { MSDSCheckbox } from './MSDSCheckbox';
import { MSDSDatePicker } from './MSDSDatePicker';
import { MSDSTextField } from './MSDSTextField';
import { CustomsCodeField } from './CustomsCodeField';
import { LookupService, LookupServiceCached } from '../services/lookup-service';
import { MsdsTagPickerField } from './MsdsTagPickerField';
import { useCustomers } from '../hooks/useCustomers';
import { useDatabases } from '../hooks/useDatabases';
import { useSites } from '../hooks/useSites';
import { IMSDSRequest } from '../services/IMSDSRequest';
import { ITag, Text } from 'office-ui-fabric-react';
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
import { DIALOG_ID, SPINNER_ID } from '../constants';
import { useAttachments } from '../hooks/useAttachments';
import { MsdsAttachmentsDetails } from './MsdsAttachmentsDetails';
import { useFieldEffects } from '../hooks/useFieldEffects';
import { useApprovers } from '../hooks/useApprovers';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Logo } from './Logo';
import KTNLogo from './KTNLogo';
import { ICommentSectionProps } from './CommentSection';
import styles from './MsdsForm.module.scss';
import { decodeXML, encodeXML } from '../utils';

export interface IMsdsFormProps {
    context: FormCustomizerContext;
    displayMode: FormDisplayMode;
    onSave: () => void;
    onClose: () => void;
    item?: IMSDSRequest;
    etag?: string;
    CommentSection?: React.FC<ICommentSectionProps>;
}

function encodeItem(item: Partial<IMSDSRequest>): Partial<IMSDSRequest> {
    const result = { ...item };
    if (result.ProductRemarks) {
        result.ProductRemarks = encodeXML(item.ProductRemarks);
    }
    if (result.SiloRemarks) {
        result.SiloRemarks = encodeXML(item.SiloRemarks);
    }
    if (result.DescriptionOnLabel) {
        result.DescriptionOnLabel = encodeXML(item.DescriptionOnLabel);
    }
    if (result.SafetyRemarks) {
        result.SafetyRemarks = encodeXML(item.SafetyRemarks);
    }
    if (result.ProductName) {
        result.ProductName = encodeXML(item.ProductName);
    }
    if (result.DedicatedFlexiblesValves) {
        result.DedicatedFlexiblesValves = encodeXML(
            item.DedicatedFlexiblesValves
        );
    }
    if (result.MOC) {
        result.MOC = encodeXML(item.MOC);
    }
    return result;
}

function decodeItem(item: Partial<IMSDSRequest>): Partial<IMSDSRequest> {
    const result = { ...item };
    if (result.ProductRemarks) {
        result.ProductRemarks = decodeXML(item.ProductRemarks);
    }
    if (result.SafetyRemarks) {
        result.SafetyRemarks = decodeXML(item.SafetyRemarks);
    }
    if (result.SiloRemarks) {
        result.SiloRemarks = decodeXML(item.SiloRemarks);
    }
    if (result.DescriptionOnLabel) {
        result.DescriptionOnLabel = decodeXML(item.DescriptionOnLabel);
    }
    if (result.ProductName) {
        result.ProductName = decodeXML(item.ProductName);
    }
    if (result.DedicatedFlexiblesValves) {
        result.DedicatedFlexiblesValves = decodeXML(
            item.DedicatedFlexiblesValves
        );
    }
    if (result.MOC) {
        result.MOC = decodeXML(item.MOC);
    }
    return result;
}

export const MsdsForm: React.FC<IMsdsFormProps> = ({
    CommentSection,
    ...props
}) => {
    const [collapsedBlocks, setCollapsedBlocks] = React.useState({
        applicant: true,
        approver: props.displayMode === FormDisplayMode.New ? false : true,
    });
    const [disabledFields, setdisabledFields] = React.useState<
        (keyof IMSDSRequest)[]
    >([]);
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { dirtyFields, isDirty },
    } = useForm<Partial<IMSDSRequest & { Attachments: File[] }>>({
        mode: 'onChange',
        defaultValues: {
            Urgency: 'Medium',
            WarehouseType: 'Default (non-hazardous)',
        },
        values: decodeItem(props.item) || {},
    });

    const site = watch('Site');
    const database = watch('Database');
    console.log(database);
    const materialType = watch('MaterialType');
    const hasSDS = watch('HasMsds');
    const field = useFields(site);
    const customers = useCustomers(database, props.item?.CustomerNameId);
    const databases = useDatabases(site);
    const approvers = useApprovers(site);
    const currentUser = useCurrentUser();
    const isCurrentUserApprover = React.useMemo(() => {
        if (currentUser && approvers.options.length > 0) {
            return (
                approvers.options[0].HSEQresponsable.find(
                    (a) => a.Id === currentUser.Id
                ) !== undefined
            );
        }
        return false;
    }, [currentUser, approvers]);
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
                    const payload = encodeItem(data);
                    payload.IsApprovalNeeded = true;
                    const addedItem = await ItemService.createItem(payload);
                    await ItemService.addAttachments(
                        addedItem.data.Id,
                        data.Attachments
                    );
                    props.onSave();
                } else {
                    let payload: Partial<IMSDSRequest> = {};
                    // Only add modified fields to the payload
                    for (const key in data) {
                        if (Object.prototype.hasOwnProperty.call(data, key)) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const element = (data as any)[key];
                            // If field was modified, add it to the payload
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            if ((dirtyFields as any)[key]) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (payload as any)[key] = element;
                            }
                        }
                    }
                    payload = encodeItem(payload);
                    // decide whether approval is needed
                    // if current user is an approver for the selected site, no approval needed
                    if (approvers.options.length > 0) {
                        payload.IsApprovalNeeded = !isCurrentUserApprover;
                    }
                    await ItemService.updateItem(props.item.Id, payload);
                    props.onSave();
                }
            } finally {
                hideSpinner(SPINNER_ID);
            }
        },
        [
            props.onSave,
            props.displayMode,
            dirtyFields,
            isCurrentUserApprover,
            approvers,
        ]
    );

    useFieldEffects(watch, isDirty, setValue, setdisabledFields);

    return (
        <div className={styles.formContainer}>
            <div
                className="backgroundPrimaryColor"
                style={{
                    height: '120px',
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'center',
                    gap: '1em',
                }}
            >
                <KTNLogo style={{ height: '100px', marginLeft: '1em' }} />
                <Text variant="xxLargePlus" className={styles.headerText}>
                    Web application form
                </Text>
            </div>
            <form
                className={styles.msdsForm}
                onSubmit={handleSubmit(CreateOrSave)}
            >
                <div>
                    <div className={styles.padLeft}>
                        <div
                            style={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                gap: '.5em',
                                alignItems: 'center',
                            }}
                        >
                            <Logo
                                style={{
                                    marginTop: '.5em',
                                    minWidth: '30px',
                                    width: '30px',
                                }}
                            />
                            <Text variant="medium">
                                {' '}
                                – Fields that will affect PLATO
                            </Text>
                        </div>
                        <LoadingSpinner id={SPINNER_ID} />
                        <Dialog id={DIALOG_ID} />
                        <Collapsible
                            headerText="Applicant"
                            isOpen={collapsedBlocks.applicant}
                            onToggle={() =>
                                handleToggle('applicant', setCollapsedBlocks)
                            }
                        >
                            {/* Row 1 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1}`}
                            >
                                <div className="width-20p">
                                    <MsdsTagPickerField
                                        id="Site"
                                        label="1. Site"
                                        title="Application where SITE can be find"
                                        tags={sites.tags}
                                        handleFilter={(filter) => {
                                            return handleFilter(
                                                sites.tags,
                                                filter
                                            );
                                        }}
                                        control={control}
                                        rules={{ required: 'Site is required' }}
                                    />
                                </div>

                                <div className="width-25p">
                                    <MsdsTagPickerField
                                        id="Database"
                                        label="2.Database"
                                        title="Application where SITE can be found"
                                        tags={databases.tags}
                                        handleFilter={async (filter) => {
                                            return handleFilter(
                                                databases.tags,
                                                filter
                                            );
                                        }}
                                        control={control}
                                        rules={{
                                            required: 'Database is required',
                                            disabled:
                                                field.Database === 'Disabled',
                                        }}
                                    />
                                </div>

                                <div className="width-20p">
                                    <MsdsTagPickerField
                                        id="MaterialType"
                                        label="3.Material type"
                                        tags={materialTypes.tags}
                                        handleFilter={async (filter) => {
                                            return handleFilter(
                                                materialTypes.tags,
                                                filter
                                            );
                                        }}
                                        control={control}
                                        rules={{
                                            required:
                                                'Material type is required',
                                            disabled:
                                                field.MaterialType ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="HasMsds"
                                        label="4.Do you have an SDS? / Not older than 3 years"
                                        title="16 sections / guidelines / Max 3 years old"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.HasMsds === 'Disabled',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
                                    <MSDSDatePicker
                                        id="MSDSDate"
                                        label="5.Latest SDS issued / revised"
                                        pickerProps={{
                                            maxDate: new Date(),
                                            allowTextInput: true,
                                        }}
                                        control={control}
                                        rules={{
                                            required:
                                                materialType ===
                                                'Finished goods'
                                                    ? 'MSDS Date is required'
                                                    : false,
                                            disabled:
                                                field.MSDSDate === 'Disabled',
                                            validate: (value) => {
                                                const todayMinusThreeYears =
                                                    new Date(
                                                        new Date().setFullYear(
                                                            new Date().getFullYear() -
                                                                3
                                                        )
                                                    );
                                                const date = new Date(value);
                                                if (
                                                    hasSDS &&
                                                    date < todayMinusThreeYears
                                                ) {
                                                    return 'SDS Date must be within the last 3 years';
                                                }
                                                return true;
                                            },
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSTextField
                                        id="CasNo"
                                        label="6.SDS Cas No."
                                        title="CAS Registry Number is a unique numerical identifier assigned by Chemical Abstracts Service CAS"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.CasNo === 'Disabled',
                                            maxLength: {
                                                value: 30,
                                                message:
                                                    'Cas No. cannot be longer than 30 characters',
                                            },
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-20p">
                                    <MsdsTagPickerField
                                        id="CustomerNameId"
                                        label="7.Customer name in Plato"
                                        tags={customers.tags}
                                        handleFilter={async (filter) => {
                                            const customerItems =
                                                await LookupService.getCustomerFilter(
                                                    filter,
                                                    database || ''
                                                );
                                            return customerItems.map((c) => ({
                                                name: c.Title,
                                                key: c.Id,
                                            }));
                                        }}
                                        handleSelect={async (tag) => {
                                            if (tag) {
                                                const customer =
                                                    await LookupServiceCached.getCustomer(
                                                        +tag.key
                                                    );
                                                customers.set((prev) => {
                                                    if (
                                                        !prev.find(
                                                            (c) =>
                                                                c.Id ===
                                                                customer.Id
                                                        )
                                                    ) {
                                                        return [
                                                            ...prev,
                                                            customer,
                                                        ];
                                                    }
                                                    return prev;
                                                });
                                            }
                                        }}
                                        control={control}
                                        rules={{
                                            required: 'Customer is required',
                                            disabled:
                                                field.CustomerName ===
                                                    'Disabled' ||
                                                Boolean(database) === false,
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSTextField
                                        id="ProductName"
                                        label="8.Product name to create in Plato"
                                        title="if created product name ≠ name on SDS, confirmation of customer to be attached"
                                        control={control}
                                        rules={{
                                            required:
                                                'Product name is required',
                                            disabled:
                                                field.ProductName ===
                                                'Disabled',
                                            pattern: {
                                                value: /^[a-zA-Z0-9\s_.-]+$/,
                                                message:
                                                    "PLATO doesn't allow special characters in product names. Please adjust the product name accordingly.",
                                            },
                                            maxLength: {
                                                value: 35,
                                                message:
                                                    'PLATO cannot handle product names longer than 35 characters',
                                            },
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
                                    <CustomsCodeField
                                        id="CustomsCode"
                                        label="9.Customs code"
                                        title="Important for Customs formalities - not on SDS - to be confirmed with customer by mail - MUST ALWAYS be mentioned also in case of no customs: 0000000000"
                                        fieldProps={{
                                            mask: '9999999999',
                                        }}
                                        control={control}
                                        rules={{
                                            required:
                                                'Customs code is required',
                                            disabled:
                                                field.CustomsCode ===
                                                'Disabled',
                                            minLength: {
                                                message:
                                                    'Customs code should be 10 digits',
                                                value: 10,
                                            },
                                            maxLength: {
                                                message:
                                                    'Customs code should be 10 digits',
                                                value: 10,
                                            },
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MsdsTagPickerField
                                        id="FormShape"
                                        label="10.Form / Shape"
                                        tags={formShapes.tags}
                                        handleFilter={async (filter) =>
                                            handleFilter(
                                                formShapes.tags,
                                                filter
                                            )
                                        }
                                        control={control}
                                        rules={{
                                            required:
                                                'Form or shape is required',
                                            disabled:
                                                field.FormShape === 'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-20p">
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
                                            disabled:
                                                field.Color === 'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="PackedOperations"
                                        label="12.PACKED OPERATIONS NEEDED?"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.PackedOperations ===
                                                'Disabled',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
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
                                            disabled:
                                                disabledFields.indexOf(
                                                    'WarehouseType'
                                                ) > -1 ||
                                                field.WarehouseType ===
                                                    'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="DebaggingOperations"
                                        label="14.DEBAGGING OPERATIONS NEEDED?"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.DebaggingOperations ===
                                                'Disabled',
                                        }}
                                    />
                                </div>

                                <div className="width-20p">
                                    <MSDSCheckbox
                                        id="SiloOperations"
                                        label="15.SILO OPERATION OPERATION NEEDED?"
                                        control={control}
                                        rules={{
                                            disabled:
                                                disabledFields.indexOf(
                                                    'SiloOperations'
                                                ) > -1 ||
                                                field.SiloOperations ===
                                                    'Disabled',
                                        }}
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSTextField
                                        id="MeltingPoint"
                                        label="16.Melting point? °C/°F"
                                        fieldProps={{
                                            suffix: '°C/°F',
                                            type: 'number',
                                            autoComplete: 'off',
                                        }}
                                        control={control}
                                        rules={{
                                            min: {
                                                message:
                                                    'Melting point cannot be negative',
                                                value: 0,
                                            },
                                            required:
                                                'Melting point is required',
                                            disabled:
                                                disabledFields.indexOf(
                                                    'MeltingPoint'
                                                ) > -1 ||
                                                field.MeltingPoint ===
                                                    'Disabled',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
                                    <MSDSCheckbox
                                        id="Abrasive"
                                        label="17.Abrasive? Filled with short glass fiber"
                                        title="Glass filled granulate is an information that is normally mentioned."
                                        control={control}
                                        rules={{
                                            disabled:
                                                disabledFields.indexOf(
                                                    'Abrasive'
                                                ) > -1 ||
                                                field.Abrasive === 'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="Hygroscopic"
                                        label="18.Hygroscopic? Tending to absorb moisture, water from air."
                                        title="Not always clear on SDS, to be confirmed by customer!  Aluminium bags or liner is an indication.  Section 7"
                                        control={control}
                                        rules={{
                                            disabled:
                                                disabledFields.indexOf(
                                                    'Hygroscopic'
                                                ) > -1 ||
                                                field.Hygroscopic ===
                                                    'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-20p">
                                    <MSDSCheckbox
                                        id="ForbiddenMixedSites"
                                        label="19.Forbidden mixed production site in silo?"
                                        title="Default = YES No mix of same producttype produced at different plants may be mixed. "
                                        control={control}
                                        rules={{
                                            disabled:
                                                disabledFields.indexOf(
                                                    'ForbiddenMixedSites'
                                                ) > -1 ||
                                                field.ForbiddenMixedSites ===
                                                    'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSTextField
                                        id="DedicatedFlexiblesValves"
                                        label="20.Dedicated Flexible(s)? Rotary Valve(s)?"
                                        title="Operational or customer service knowledge for dedicated equipment if any"
                                        fieldProps={{
                                            multiline: true,
                                            autoAdjustHeight: true,
                                        }}
                                        control={control}
                                        rules={{
                                            disabled:
                                                disabledFields.indexOf(
                                                    'DedicatedFlexiblesValves'
                                                ) > -1 ||
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
                                <div className="width-20p">
                                    <MSDSTextField
                                        id="DescriptionOnLabel"
                                        label="21.Description on label?"
                                        title="In case a customer requires a specific mark or sign on the labels.  F.i. DUPONT requires  ®"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.DescriptionOnLabel ===
                                                'Disabled',
                                            maxLength: {
                                                value: 35,
                                                message:
                                                    'Description on label can be 35 characters max',
                                            },
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                                <div className="width-25p">
                                    <MsdsTagPickerField
                                        id="SDSPublisher"
                                        label="22. SDS Publisher"
                                        tags={customers.tags}
                                        handleFilter={async (filter) => {
                                            const customerItems =
                                                await LookupService.getCustomerFilter(
                                                    filter,
                                                    database || ''
                                                );
                                            return customerItems.map((c) => ({
                                                name: c.Title,
                                                key: c.Title,
                                            }));
                                        }}
                                        handleSelect={async (tag) => {
                                            if (tag) {
                                                const customer =
                                                    await LookupServiceCached.getCustomer(
                                                        +tag.key
                                                    );
                                                customers.set((prev) => {
                                                    if (
                                                        !prev.find(
                                                            (c) =>
                                                                c.Id ===
                                                                customer.Id
                                                        )
                                                    ) {
                                                        return [
                                                            ...prev,
                                                            customer,
                                                        ];
                                                    }
                                                    return prev;
                                                });
                                            }
                                        }}
										getValue={(option) => option.name}
                                        control={control}
                                        rules={{
                                            required: 'SDS Publisher is required',
                                            disabled:
                                                field.SDSPublisher === 'Disabled' || Boolean(database) === false,
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                                <div className="width-20p">
                                    <MSDSTextField
                                        id="ProductNameOnSDS"
                                        label="23. Product name on SDS"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.ProductNameOnSDS ===
                                                'Disabled',
                                            maxLength: {
                                                value: 80,
                                                message:
                                                    'Product name on SDS can be 80 characters max',
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z0-9\s_.-]+$/,
                                                message:
                                                    'Special characters are not allowed',
                                            },
											required: 'Product name on SDS is required',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                                <div className="width-25p">
                                    <MSDSTextField
                                        id="SDSVersion"
                                        label="24. SDS Version"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.SDSVersion === 'Disabled',
                                            maxLength: {
                                                value: 25,
                                                message:
                                                    'SDS Version can be 80 characters max',
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z0-9\s_.-]+$/,
                                                message:
                                                    'Special characters are not allowed',
                                            },
											required: 'SDS Version is required'
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </div>
                            {/* Row 5 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
                                    <MSDSTextField
                                        id="DescriptionOnDriversDocument"
                                        label="25. Description on drivers document"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.DescriptionOnDriversDocument ===
                                                'Disabled',
                                            maxLength: {
                                                value: 60,
                                                message:
                                                    'Description on drivers document can be 60 characters max',
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z0-9\s_.-]+$/,
                                                message:
                                                    'Special characters are not allowed',
                                            },
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                                <div className="width-25p">
                                    <MsdsTagPickerField
                                        id="Urgency"
                                        label="26.Urgency"
                                        tags={urgencyTags}
                                        handleFilter={async (filter) =>
                                            handleFilter(urgencyTags, filter)
                                        }
                                        control={control}
                                        rules={{
                                            required: 'Urgency is required',
                                            disabled:
                                                field.Urgency === 'Disabled',
                                        }}
                                    />
                                </div>
                            </div>
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-25p">
                                    {props.displayMode ===
                                    FormDisplayMode.New ? (
                                        <MSDSAttachmentsNew
                                            id="Attachments"
                                            label="27.Attachments (NOTE: Name SDS PDF as product name)"
                                            control={control}
                                            title="Add SDS PDF and customer confirmation mail. "
                                            rules={{
                                                required:
                                                    'Attachments are required',
                                            }}
                                        />
                                    ) : (
                                        <MsdsAttachmentsDetails
                                            id="Attachments"
                                            label="23.Attachments (NOTE: Name SDS PDF as product name)"
                                            title="Add SDS PDF and customer confirmation mail. NOTE: Rename the SDS file to the product name before uploading."
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
                            onToggle={() =>
                                handleToggle('approver', setCollapsedBlocks)
                            }
                        >
                            {/* Row 1 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1}`}
                            >
                                <div className="width-20p">
                                    <MSDSCheckbox
                                        id="StorageManipApproved"
                                        label="1.Storage and manipulation of the product allowed"
                                        title="Check if product can be stored according your permit (f.i. amount of dangerous goods)."
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.StorageManipApproved ===
                                                'Disabled',
                                        }}
                                    />
                                </div>

                                <div className="width-25p">
                                    <MsdsTagPickerField
                                        id="ProductType"
                                        label="2.Product type"
                                        tags={productTypes.tags}
                                        handleFilter={async (filter) =>
                                            handleFilter(
                                                productTypes.tags,
                                                filter
                                            )
                                        }
                                        control={control}
                                        rules={{
                                            required: isCurrentUserApprover
                                                ? 'Product type is required'
                                                : false,
                                            disabled:
                                                field.ProductType ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="ForbiddenForBulk"
                                        label="3.Forbidden for bulk?"
                                        title="See product type forbidden = Emulsion PVC, rubber,… / Melting point <50°C / …"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.ForbiddenForBulk ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-20p">
                                    <MSDSSpinButton
                                        id="BulkDensity"
                                        label="4.Bulk density Plato"
                                        control={control}
                                        title="Density must be measured and tapped for Granulates + only measured for Powder, flakes and fluff."
                                        rules={{
                                            disabled:
                                                disabledFields.indexOf(
                                                    'BulkDensity'
                                                ) > -1 ||
                                                field.BulkDensity ===
                                                    'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
                                    <MSDSCheckbox
                                        id="MeasuredBulkDensity"
                                        label="5. Measured bulk density"
                                        control={control}
                                        rules={{
                                            disabled:
                                                disabledFields.indexOf(
                                                    'MeasuredBulkDensity'
                                                ) > -1 ||
                                                field.MeasuredBulkDensity ===
                                                    'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="ManipNotAllowed"
                                        label="6.Manipulation(change) not allowed"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.ManipNotAllowed ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSTextField
                                        id="ProductRemarks"
                                        label="7.Product remarks"
                                        title="f.i.Glassfilled product."
                                        fieldProps={{
                                            multiline: true,
                                            autoAdjustHeight: true,
                                        }}
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.ProductRemarks ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-20p">
                                    <MSDSTextField
                                        id="SafetyRemarks"
                                        label="8.SAFETY REMARKS Printed on each order."
                                        title="F.i. Fire fighting equipment, storage & handling conditions, dust explosion => earthing"
                                        fieldProps={{
                                            multiline: true,
                                            autoAdjustHeight: true,
                                        }}
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.SafetyRemarks ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
                                    <MSDSTextField
                                        id="SiloRemarks"
                                        label="9.REMARKS SILO operations"
                                        title="F.i. sticky product  (stick potentials) may not be stored in silos in the outer rows of the silo battery."
                                        fieldProps={{
                                            multiline: true,
                                            autoAdjustHeight: true,
                                        }}
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.SiloRemarks ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MsdsTagPickerField
                                        id="HazardousGoods"
                                        label="10.HAZARDOUS GOODS products code"
                                        title="Check section 2 of MSDS pdf"
                                        tags={hazardousGoodsCodes.tags}
                                        handleFilter={async (filter) =>
                                            handleFilter(
                                                hazardousGoodsCodes.tags,
                                                filter
                                            )
                                        }
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.HazardousGoods ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="DustCategory"
                                        label="11.Dust category"
                                        title="If shape FLUFF/Powder check dust category(For Approver)"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.DustCategory ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>

                                <div className="width-20p">
                                    <MSDSCheckbox
                                        id="NitrogenCoverage"
                                        label="12.Nitrogen coverage"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.NitrogenCoverage ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div
                                className={`${styles.msdsRow} ${styles.msdsGap1} margin-top-2`}
                            >
                                <div className="width-20p">
                                    <MSDSCheckbox
                                        id="ClientRequirementsFnF"
                                        label="13.Client requirements on food & feed (GMP) regulations?"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.ClientRequirementsFnF ===
                                                'Disabled',
                                        }}
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSTextField
                                        id="MOC"
                                        label="14.MOC Management of change"
                                        title="CONSULTATION + INFORMATION when changing product, operation or conditions mark  + forward this form"
                                        fieldProps={{
                                            multiline: true,
                                            autoAdjustHeight: true,
                                        }}
                                        control={control}
                                        rules={{
                                            disabled: field.MOC === 'Disabled',
                                        }}
                                    />
                                </div>

                                <div className="width-25p">
                                    <MSDSCheckbox
                                        id="ExtraCheckNeeded"
                                        label="15.Extra check needed by quality in Plato ? Approver product will activate PM in Plato!"
                                        control={control}
                                        rules={{
                                            disabled:
                                                field.ExtraCheckNeeded ===
                                                'Disabled',
                                        }}
                                        icon={
                                            <Logo
                                                style={{
                                                    marginRight: '.3em',
                                                    minWidth: '20px',
                                                    width: '20px',
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </div>
                        </Collapsible>
                        <Buttons
                            displayMode={props.displayMode}
                            onClose={props.onClose}
                            onSave={props.onSave}
                        />
                    </div>
                    {CommentSection && (
                        <CommentSection
                            className={styles.commentSection}
                            item={props.item}
                            currentUser={currentUser}
                        />
                    )}
                </div>
            </form>
        </div>
    );
};
