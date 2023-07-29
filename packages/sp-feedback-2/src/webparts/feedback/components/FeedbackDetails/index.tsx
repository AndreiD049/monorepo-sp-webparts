import {
    Callout,
    Icon,
    IconButton,
    Pivot,
    PivotItem,
    PivotLinkFormat,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../../Context';
import { on } from '../../features/events';
import { ICountry } from '../../features/feedback-form/countries';
import { FeedbackService } from '../../features/feedback/feedback-service';
import { TagAddButton } from '../../features/tags/TagAddButton';
import { TagPill } from '../../features/tags/TagPill';
import { IFeedback } from '../../models/IFeedback';
import { EditableText } from '../EditableText';
import { RichEditor } from '../RichEditor/RichEditor';
import styles from './FeedbackDetails.module.scss';

export interface IFeedbackDetailsProps {
    feedbackId: number;
    onDismiss: () => void;
}

const EditDropdown: React.FC = () => {
    const target = React.useRef(null);
    const [calloutVisible, setCalloutVisible] = React.useState(false);

    return (
        <div ref={target} className={styles.dropdown}>
            <input
                type="text"
                autoComplete="off"
                value="Test value"
                onFocus={() => setCalloutVisible((prev) => !prev)}
                onBlur={() => setCalloutVisible(false)}
            />
            <div className={styles.dropdownIcon}></div>
            <Callout
                styles={{
                    root: {
                        minWidth: target.current
                            ? target.current.clientWidth
                            : 0,
                    },
                }}
                target={target}
                isBeakVisible={false}
                hidden={!calloutVisible}
            >
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            </Callout>
        </div>
    );
};

export const FeedbackDetails: React.FC<IFeedbackDetailsProps> = (props) => {
    const [feedback, setFeedback] = React.useState<IFeedback>(null);
    const { requestTypes, countries } = React.useContext(GlobalContext);

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
        const clear = on('tag-add', (ev) => {
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
        const clear = on('tag-delete', (ev) => {
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
            <TagPill tag={tag} feedbackId={feedback.ID} />
        ));
    }

    let country: ICountry = null;
    if (feedback.Country) {
        country = countries.find((c) => c.Data.code === feedback.Country);
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <span className={styles.titleText}>
                    {titleIcon}
                    <EditableText
                        value={feedback.Title}
                        handleUpdate={(v) => console.log(v)}
                    />
                </span>
                <IconButton
                    className={styles.closeButton}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={props.onDismiss}
                />
            </div>
            <div className={styles.body}>
                <div className={styles.tagBar}>
                    {tags}
                    <TagAddButton feedbackId={feedback.ID} />
                </div>
                <div className={styles.properties}>
                    <p>
                        <b>Status:</b> <EditDropdown />
                    </p>
                    <p>
                        <b>Category:</b> {feedback.Category}
                    </p>
                    <p>
                        <b>Country:</b>{' '}
                        {country ? country.Data.name : feedback.Country}
                    </p>
                </div>
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
                            <RichEditor initialCotnent={feedback.Description} />
                        </PivotItem>
                        <PivotItem headerText="Attachments">
                            <b>Attachments</b>
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
