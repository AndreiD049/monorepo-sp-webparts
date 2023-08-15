import { debounce } from '@microsoft/sp-lodash-subset';
import {
    Icon,
    IconButton,
    IDropdownOption,
    Pivot,
    PivotItem,
    PivotLinkFormat,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../../Context';
import { Identifier, on } from '../../features/events';
import { ICountry } from '../../features/feedback-form/countries';
import { FeedbackService } from '../../features/feedback/feedback-service';
import { TagAddButton } from '../../features/tags/TagAddButton';
import { TagPill } from '../../features/tags/TagPill';
import { IFeedback, StatusType, STATUS_TYPES } from '../../models/IFeedback';
import { EditableText } from '../EditableText';
import { FeedbackAttachments } from '../FeedbackAttachments';
import { PropertyDropdown } from '../PropertyDropdown';
import { RichEditor } from '../RichEditor/RichEditor';
import styles from './FeedbackDetails.module.scss';

const LABEL_WIDTH = 75;
const DROPDOWN_WIDTH = 200;
const COUNTRY_CDN_URL = 'https://flagcdn.com';

export interface IFeedbackDetailsProps {
    feedbackId: number;
    onDismiss: () => void;
}

const StatusDropdown: React.FC<{
    value: string;
	editable: boolean;
    onChange: (value: StatusType) => void;
}> = (props) => {
    const [val, setVal] = React.useState(props.value);
    const options = STATUS_TYPES.map((status) => ({
        key: status,
        text: status,
    }));

    const handleChange = (
        _e: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ): void => {
		if (!props.editable) {
			return;
		}
        if (option) {
            setVal(option.key as string);
            props.onChange(option.key as StatusType);
        }
    };

    return (
        <PropertyDropdown
            label="Status"
            placeholder="Select an option"
            options={options}
            selectedKey={val}
            onChange={handleChange}
			readonly={!props.editable}
            styles={{
                dropdown: {
                    width: DROPDOWN_WIDTH,
                },
                label: {
                    width: LABEL_WIDTH,
                },
            }}
        />
    );
};

const CategoryDropdown: React.FC<{
    value: string;
	editable: boolean;
    onChange: (value: string) => void;
}> = (props) => {
    const { requestTypes } = React.useContext(GlobalContext);
    const [val, setVal] = React.useState(props.value);
    const options: IDropdownOption[] = Object.keys(requestTypes).map((key) => ({
        key,
        text: requestTypes[key].Data.name,
        data: requestTypes[key].Data.iconName,
    }));

    const handleChange = (
        _e: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ): void => {
		if (!props.editable) {
			return;
		}
        if (option) {
            setVal(option.key as string);
            props.onChange(option.key as string);
        }
    };

    const renderOption = (option?: IDropdownOption): JSX.Element => {
        const elements = [];
        if (option.data) {
            elements.push(
                <Icon iconName={option.data} style={{ marginRight: '.5em' }} />
            );
        }

        elements.push(<span>{option.text}</span>);

        return <div>{elements}</div>;
    };

    return (
        <PropertyDropdown
            label="Category"
            placeholder="Select an option"
            options={options}
            selectedKey={val}
			readonly={!props.editable}
            onChange={handleChange}
            onRenderOption={renderOption}
            onRenderTitle={(options) => renderOption(options[0])}
            styles={{
                dropdown: {
                    width: DROPDOWN_WIDTH,
                },
                label: {
                    width: LABEL_WIDTH,
                },
            }}
        />
    );
};

const CountryDropdown: React.FC<{
    value: string;
	editable: boolean;
    onChange: (value: string) => void;
}> = (props) => {
    const [val, setVal] = React.useState(props.value);
    const { countries } = React.useContext(GlobalContext);
    const options = countries.map((country) => ({
        key: country.Data.code,
        text: country.Data.name,
    }));

    const onChange = (
        _event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ): void => {
		if (!props.editable) {
			return;
		}
        if (option) {
            setVal(option.key as string);
            props.onChange(option.key as string);
        }
    };

    const renderOption = (option?: IDropdownOption): JSX.Element => {
        const elements = [];
        if (option) {
            const countryCode = (option.key as string).toLowerCase();
            const w20 = COUNTRY_CDN_URL + '/w20/' + countryCode + '.png';
            const w40 = COUNTRY_CDN_URL + '/w40/' + countryCode + '.png';
            elements.push(
                <img
                    src={w20}
                    srcSet={w40}
                    width="20"
                    height="13.5"
                    style={{ marginRight: '.5em' }}
                />
            );
        }

        elements.push(<span>{option.text}</span>);

        return <div>{elements}</div>;
    };

    return (
        <PropertyDropdown
            label="Country"
            placeholder="Select an option"
            options={options}
            selectedKey={val}
			readonly={!props.editable}
            onChange={onChange}
            onRenderOption={renderOption}
            onRenderTitle={(options) => renderOption(options[0])}
            styles={{
                dropdown: {
                    width: DROPDOWN_WIDTH,
                },
                label: {
                    width: LABEL_WIDTH,
                },
            }}
        />
    );
};

const ApplicationDropdown: React.FC<{
    value: string;
	editable: boolean;
    onChange: (val: string) => void;
}> = (props) => {
    const { applications } = React.useContext(GlobalContext);
    const [val, setVal] = React.useState(props.value);
    const options = applications
        .map((app) => ({
            key: app.Data.name,
            text: app.Data.name,
        }))
        .concat([
            {
                key: 'NA',
                text: 'Not applicable',
            },
            {
                key: 'Other',
                text: 'Other',
            },
        ]);

    const handleChange = (
        _e: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ): void => {
		if (!props.editable) {
			return;
		}
        if (option) {
            setVal(option.key as string);
            props.onChange(option.key as StatusType);
        }
    };

    return (
        <PropertyDropdown
            label="Application"
            placeholder="Select an option"
            options={options}
			readonly={!props.editable}
            selectedKey={val}
            onChange={handleChange}
            styles={{
                dropdown: {
                    width: DROPDOWN_WIDTH,
                },
                label: {
                    width: LABEL_WIDTH,
                },
            }}
        />
    );
};

export const FeedbackDetails: React.FC<IFeedbackDetailsProps> = (props) => {
    const [feedback, setFeedback] = React.useState<IFeedback>(null);
    const { requestTypes, countries, isTestManager } = React.useContext(GlobalContext);

	let canEdit = isTestManager;
	if (feedback && feedback.Status === 'New') {
		canEdit = true;
	}

    React.useEffect(() => {
        FeedbackService.getFeedback(props.feedbackId)
            .then((feedback) => {
                setFeedback(feedback);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    React.useEffect(() => {
        const clear = on<Identifier<string>>('tag-add', (ev) => {
            const { id, value } = ev.detail;
            if (id !== feedback.ID) return;
            setFeedback((prev) => {
                let result = prev.Tags;
                if (!Array.isArray(result)) {
                    result = [value];
                } else if (result.indexOf(value) === -1) {
                    result.push(value);
                }
                return {
                    ...prev,
                    Tags: result,
                };
            });
        });
        return clear;
    }, [feedback]);

    React.useEffect(() => {
        const clear = on<Identifier<string>>('tag-delete', (ev) => {
            const { id, value } = ev.detail;
            if (id !== feedback.ID) return;
            setFeedback((prev) => ({
                ...prev,
                Tags: prev.Tags.filter((t) => t !== value),
            }));
        });
        return clear;
    }, [feedback]);

    if (!feedback) {
        // TODO: replace this with a skeleton loader
        return null;
    }

    const requestType = requestTypes[feedback.Category];
    const iconName = requestType ? requestType.Data.iconName : null;
    let titleIcon = null;
    if (requestType && iconName) {
        titleIcon = <Icon iconName={iconName} />;
    }

    let tags = null;
    if (feedback.Tags) {
        tags = feedback.Tags.map((tag) => (
            <TagPill key={tag} tag={tag} feedbackId={feedback.ID} disabled={!canEdit} />
        ));
    }

    let country: ICountry = null;
    if (feedback.Country) {
        country = countries.find((c) => c.Data.code === feedback.Country);
    }

    const handlePropUpdate = async (prop: keyof IFeedback, value: any): Promise<void> => {
        try {
            await FeedbackService.updateFeedback(feedback.ID, {
                [prop]: value,
            });
            setFeedback((prev) => ({
                ...prev,
                [prop]: value,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const debouncedUpdate = (): (typeof handlePropUpdate) => debounce(handlePropUpdate, 1000, {
        trailing: true,
    });

    return (
        <div className={styles.container}>
            {/* Editable title of the feedback */}
            <div className={styles.title}>
                <span className={styles.titleText}>
                    {titleIcon}
                    <EditableText
                        value={feedback.Title}
						readOnly={!canEdit}
                        handleUpdate={(value) =>
                            handlePropUpdate('Title', value)
                        }
                    />
                </span>
                <IconButton
                    className={styles.closeButton}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={props.onDismiss}
                />
            </div>

            {/* Main details of the feedback */}
            <div className={styles.body}>
                <div className={styles.tagBar}>
                    {tags}
                    <TagAddButton feedbackId={feedback.ID} disabled={!canEdit} />
                </div>
                <div className={styles.properties}>
                    <StatusDropdown
                        value={feedback.Status}
                        onChange={(val) => debouncedUpdate()('Status', val)}
						editable={isTestManager}
                    />
                    <ApplicationDropdown
                        value={feedback.Application}
                        onChange={(val) => debouncedUpdate()('Application', val)}
						editable={canEdit}
                    />
                    <CategoryDropdown
                        value={feedback.Category}
                        onChange={(val) => debouncedUpdate()('Category', val)}
						editable={canEdit}
                    />
                    {country && country.Data && (
                        <CountryDropdown
                            value={country.Data.code}
                            onChange={(val) => debouncedUpdate()('Country', val)}
							editable={canEdit}
                        />
                    )}
                </div>

                {/* Bottom tabs */}
                <div className={styles.bottomTabs}>
                    <Pivot
                        linkFormat={PivotLinkFormat.links}
                        styles={{
                            itemContainer: {
                                marginTop: '.5em',
                                paddingBottom: '1em',
                            },
                        }}
                    >
                        <PivotItem headerText="Description">
                            <RichEditor
                                initialCotnent={feedback.Description}
								editable={canEdit}
                                onBlur={async (html) => {
                                    if (html !== feedback.Description) {
                                        await debouncedUpdate()('Description', html);
                                    }
                                }}
                            />
                        </PivotItem>
                        <PivotItem headerText="Attachments">
							<FeedbackAttachments feedbackId={feedback?.ID} />
                        </PivotItem>
                        <PivotItem headerText="Notes">
                            <b>Notes</b>
                        </PivotItem>
                    </Pivot>
                </div>
            </div>
        </div>
    );
};
