import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ICountry, getCountries } from './countries';
import { IApplication } from '../applications/IApplication';
import { getApplications } from '../applications/applications';
import { FormDropdown } from './FormDropdown';
import { getRequestTypes, IRequestType } from './request-types';
import {
    ChoiceGroup,
    DefaultButton,
    Icon,
    IconButton,
    IDropdownOption,
    Label,
    PrimaryButton,
    TextField,
} from 'office-ui-fabric-react';
import { RichEditor } from '../../components/RichEditor/RichEditor';
import { FeedbackService } from '../feedback/feedback-service';
import { Done } from './Done';
import styles from './FeedbackForm.module.scss';
import doneStyles from './Done.module.scss';

export interface IFeedbackFormProps {
    // Props go here
}

const additionalOptionOther: IDropdownOption = {
    key: 'other',
    text: 'Other',
    data: {
        Data: { code: 'other', name: 'Other' },
    },
};

const additionalOptionNA: IDropdownOption = {
    key: 'na',
    text: 'Not applicable',
    data: {
        Data: {
            code: 'na',
            name: 'NA',
            imageUrl: require('../../assets/na.png'),
        },
    },
};

const defaultImage = { src: require('../../assets/default.png') };

const RoundImage: React.FC<{
    src: string;
    width: number;
    height: number;
    className?: string;
}> = (props) => {
    const imageRef = React.useRef<HTMLImageElement>(null);
    const containerStyle: React.CSSProperties = {
        borderRadius: '50%',
        width: props.width,
        height: props.height,
        overflow: 'hidden',
    };

    const imageStyle: React.CSSProperties = {
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    return (
        <div style={containerStyle} className={props.className}>
            <img
                ref={imageRef}
                src={props.src || defaultImage.src}
                style={imageStyle}
                alt="Round image"
            />
        </div>
    );
};

function calculateLineHeight(container?: HTMLDivElement): void {
    if (!container) return;

    const parent = container.closest(`.${styles.step}`);
    if (!parent) return;

    const nextParent = parent.nextElementSibling as HTMLDivElement;
    if (!nextParent) return;

    const nextImage = nextParent.querySelector(
        `.${styles['step-visualization']}`
    ) as HTMLDivElement;
    if (!nextImage) return;

    const thisImageRect = container.getBoundingClientRect();
    const nextImageRect = nextImage.getBoundingClientRect();
    const distance = nextImageRect.top - thisImageRect.bottom;

    const line = container.querySelector(
        `.${styles['step-line']}`
    ) as HTMLDivElement;
    line.style.height = `${distance}px`;
}

function animateLine(id: string): void {
    const control = document.getElementById(id) as HTMLDivElement;
    const line = control.querySelector(
        `.${styles['step-line']}`
    ) as HTMLDivElement;
    line.classList.add(styles.show);
}

let imageTimer = 0;
function animateImage(id: string, imgSrc: string): void {
    const control = document.getElementById(id) as HTMLDivElement;
    if (!control) return;

    const parent = control.closest(`.${styles.step}`);
    if (!parent) return;

    const image = parent.querySelector(
        `.${styles['step-visualization']} img`
    ) as HTMLImageElement;

    image.classList.add(styles.hide);

	if (imageTimer > 0) {
		clearTimeout(imageTimer);
	}
    imageTimer = setTimeout(() => {
        image.src = imgSrc || defaultImage.src;
		imageTimer = 0;
        image.onload = () => {
            image.classList.remove(styles.hide);
            image.classList.add(styles.show);
        };
    }, 300);
}

const StepRoundImage: React.FC<{
    src: string;
    width: number;
    height: number;
}> = (props) => {
    const containerStyle: React.CSSProperties = {
        borderRadius: '50%',
        width: props.width * 1.1,
        height: props.height * 1.1,
    };
    const container = React.useRef<HTMLDivElement>(null);

    calculateLineHeight(container.current);

    return (
        <div
            ref={container}
            className={styles['step-visualization']}
            style={containerStyle}
        >
            <RoundImage
                src={props.src}
                width={props.width}
                height={props.height}
                className={`${styles['center-image']} ${styles['image-bg']}`}
            />
            <div className={styles['step-line']} />
        </div>
    );
};

const Step: React.FC<{
    id?: string;
    control: React.ReactNode;
    imageSrc?: string;
}> = (props) => {
    return (
        <div className={styles.step} id={props.id}>
            <div className={styles.control}>{props.control}</div>
            <div className={styles.visualization}>
                <StepRoundImage src={props.imageSrc} width={120} height={120} />
            </div>
        </div>
    );
};

const Attachments: React.FC<{disabled: boolean}> = (props) => {
    const [attachments, setAttachments] = React.useState<File[]>([]);

    return (
        <>
            <Label className={styles.attachments}>
                <span className={styles['label-text']}>Attachments:</span>
                <input
                    id="attachments"
                    type="file"
					disabled={props.disabled}
                    multiple
                    aria-multiselectable="true"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.xz,.mp3,.mp4,.avi,.mkv,.mov,.flv,.wmv,.wma,.wav,.ogg,.m4a,.aac,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.xz,.mp3,.mp4,.avi,.mkv,.mov,.flv,.wmv,.wma,.wav,.ogg,.m4a,.aac"
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                            setAttachments([
                                ...attachments,
                                ...Array.from(files),
                            ]);
                        }
                    }}
                />
                <span aria-disabled={props.disabled} role="button" className={styles['custom-button']}>
                    <Icon iconName="Attach" /> Choose files
                </span>
            </Label>
            {attachments.length > 0 && (
                <ul className={styles['attachments-list']}>
                    {attachments.map((file) => (
                        <li key={file.name}>
                            <Icon iconName="Attach" />
                            <span>{file.name}</span>
                            <IconButton
                                iconProps={{ iconName: 'Cancel' }}
								tabIndex={-1}
                                onClick={() =>
                                    setAttachments(
                                        attachments.filter(
                                            (f) => f.name !== file.name
                                        )
                                    )
                                }
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export const FeedbackForm: React.FC<IFeedbackFormProps> = () => {
    const navigate = useNavigate();
    const [country, setCountry] = React.useState<ICountry>(null);
    const [application, setApplication] = React.useState<IApplication>(null);
    const [countries, setCountries] = React.useState<ICountry[]>([]);
    const [applications, setApplications] = React.useState<IApplication[]>([]);
    const [type, setType] = React.useState<IRequestType>(null);
    const [types, setTypes] = React.useState<IRequestType[]>([]);
    const [priority, setPriority] = React.useState<string>(null);
    const [title, setTitle] = React.useState<string>('');
    const [description, setDescription] = React.useState<string>('');
    const [controlsDisabled, setControlsDisabled] =
        React.useState<boolean>(false);

    React.useEffect(() => {
        getCountries()
            .then((countries) => {
                setCountries(countries);
            })
            .catch((error) => {
                console.error(error);
            });
        getApplications()
            .then((applications) => {
                setApplications(applications);
            })
            .catch((error) => {
                console.error(error);
            });
        getRequestTypes()
            .then((types) => {
                setTypes(types);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    // Focus on country dropdown first
    React.useEffect(() => {
        const country = document.getElementById('country') as HTMLDivElement;
        const select = country.querySelector(
            '[role="combobox"]'
        ) as HTMLDivElement;
        select.focus();
    }, []);

    const onCancel = (): void => {
        const confirmed = confirm(
            'Are you sure you want to cancel?\nAll changes will be lost.'
        );
        if (confirmed) {
            navigate('/');
        }
    };

    const onSubmit = async (evt: React.FormEvent): Promise<void> => {
        setControlsDisabled(true);
        evt.preventDefault();
        await FeedbackService.addFeedback({
            Application: application?.Data.name,
            Country: country?.Data.code,
            Category: type?.Data.code,
            Priority: priority,
            Status: 'New',
            Title: title,
            Description: description,
        });

        const animation = document.getElementById(
            'done-animation'
        ) as HTMLDivElement;
        animation.classList.add(doneStyles.show);

        const animationText = animation.firstElementChild as HTMLDivElement;
        animationText.classList.add(doneStyles.show);

        setTimeout(() => navigate('/'), 3000);
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles['form-heading']}>
                    <h1>New feedback</h1>
                </div>
                <form onSubmit={onSubmit}>
                    <Step
                        id="country"
                        control={
                            <>
                                <FormDropdown
                                    disabled={controlsDisabled}
                                    options={countries}
                                    label="Country"
                                    onChange={(c) => {
                                        setCountry(c);
                                        animateLine('country');
                                        animateImage(
                                            'country',
                                            c.Data.code !== 'other' &&
                                                `https://flagcdn.com/256x192/${c.Data.code.toLowerCase()}.png`
                                        );
                                    }}
                                    transform={(opt) => ({
                                        key: opt.Data.code,
                                        text: opt.Data.name,
                                        data: opt,
                                    })}
                                    additionalOptions={[additionalOptionOther]}
                                />
                                <input
                                    tabIndex={-1}
                                    name="country"
                                    className={styles['form-invisible-input']}
                                    required
                                    value={country?.Data.code}
                                />
                            </>
                        }
                    />
                    <Step
                        id="application"
                        control={
                            <>
                                <FormDropdown
                                    disabled={controlsDisabled}
                                    options={applications}
                                    label="System"
                                    onChange={(app) => {
                                        setApplication(app);
                                        animateLine('application');
                                        animateImage(
                                            'application',
                                            app.Data.imageUrl
                                        );
                                    }}
                                    transform={(opt) => ({
                                        key: opt.Data.name,
                                        text: opt.Data.name,
                                        data: opt,
                                    })}
                                    additionalOptions={[
                                        additionalOptionOther,
                                        additionalOptionNA,
                                    ]}
                                />
                                <input
                                    tabIndex={-1}
                                    className={styles['form-invisible-input']}
                                    required
                                    value={application?.Data.name}
                                />
                            </>
                        }
                    />
                    <Step
                        id="type"
                        control={
                            <>
                                <FormDropdown
                                    disabled={controlsDisabled}
                                    options={types}
                                    label="Request type"
                                    onChange={(c) => {
                                        setType(c);
                                        animateLine('type');
                                        animateImage('type', c.Data.imageUrl);
                                    }}
                                    transform={(opt) => ({
                                        key: opt.Data.code,
                                        text: opt.Data.name,
                                        data: opt,
                                    })}
                                    additionalOptions={[additionalOptionOther]}
                                />
                                <input
                                    tabIndex={-1}
                                    className={styles['form-invisible-input']}
                                    required
                                    value={type?.Data.code}
                                />
                            </>
                        }
                    />
                    <Step
                        id="priority"
                        control={
                            <div>
                                <ChoiceGroup
                                    disabled={controlsDisabled}
                                    id="priority"
                                    required
                                    onChange={(_e, c) => {
										animateImage('priority', c.imageSrc);
                                        setPriority(c.key);
                                    }}
                                    label="Priorty"
                                    styles={{
                                        flexContainer: {
                                            flexFlow: 'row nowrap',
                                            justifyContent: 'center',
                                        },
                                    }}
                                    options={[
                                        {
                                            key: 'low',
                                            text: 'Low',
                                            imageSrc: require('../../assets/priority_low.png'),
                                            selectedImageSrc: require('../../assets/priority_low.png'),
                                            imageSize: {
                                                width: 16,
                                                height: 16,
                                            },
                                            imageAlt: 'Low priority',
                                        },
                                        {
                                            key: 'medium',
                                            text: 'Medium',
                                            imageSrc: require('../../assets/priority_medium.png'),
                                            selectedImageSrc: require('../../assets/priority_medium.png'),
                                            imageSize: {
                                                width: 16,
                                                height: 16,
                                            },
                                            imageAlt: 'Medium priority',
                                            styles: {
                                                labelWrapper: {
                                                    maxWidth: 'unset',
                                                },
                                            },
                                        },
                                        {
                                            key: 'high',
                                            text: 'High',
                                            imageSrc: require('../../assets/priority_high.png'),
                                            selectedImageSrc: require('../../assets/priority_high.png'),
                                            imageSize: {
                                                width: 16,
                                                height: 16,
                                            },
                                            imageAlt: 'High priority',
                                        },
                                    ]}
                                    defaultSelectedKey="medium"
                                />
                            </div>
                        }
                        imageSrc={require('../../assets/priority_medium.png')}
                    />
                    <div className={styles['feedback-title']}>
                        <TextField
                            disabled={controlsDisabled}
                            id="title"
                            label="Title"
                            required
                            value={title}
                            onChange={(_e, value) => setTitle(value)}
                        />
                    </div>
                    <div className={styles['rich-editor']}>
                        <Label
                            htmlFor="details"
                            onClick={() => {
                                const container =
                                    document.getElementById('details');
                                if (!container) return;

                                const editor = container.querySelector(
                                    '.ProseMirror'
                                ) as HTMLDivElement;
                                if (!editor) return;

                                editor.focus();
                            }}
                            required
                        >
                            Description
                        </Label>

                        <RichEditor
                            id="details"
                            editable={!controlsDisabled}
                            key={controlsDisabled.toString()}
                            initialCotnent={description}
                            onChange={(html) => setDescription(html)}
                        />

                        <Attachments disabled={controlsDisabled} />

                        <div className={styles['form-buttons']}>
                            <PrimaryButton
                                disabled={controlsDisabled}
                                type="submit"
                            >
                                Submit
                            </PrimaryButton>
                            <DefaultButton
                                disabled={controlsDisabled}
                                type="button"
                            >
                                Save as draft
                            </DefaultButton>
                            <DefaultButton
                                disabled={controlsDisabled}
                                onClick={onCancel}
                                type="button"
                            >
                                Cancel
                            </DefaultButton>
                        </div>
                    </div>
                </form>
            </div>
            <Done />
        </>
    );
};
