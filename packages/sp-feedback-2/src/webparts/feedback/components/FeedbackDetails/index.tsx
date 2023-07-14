import { Callout, Icon, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../../Context';
import { FeedbackService } from '../../features/feedback/feedback-service';
import { IFeedback } from '../../models/IFeedback';
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
        <div
            ref={target}
			className={styles.dropdown}
        >	
            <input
                type="text"
                autoComplete="off"
				value="Test value"
				onFocus={() => setCalloutVisible((prev) => !prev)}
				onBlur={() => setCalloutVisible(false)}
            />
			{ /*
            <Icon
                iconName="ChevronDown"
                style={{ position: 'absolute', right: 4 }}
				className={styles.dropdownIcon}
				onClick={() => {
					if (!target.current) return;
					const container = target.current as HTMLDivElement;
					if (!container) return;
					const input = container.querySelector('input');
					input.focus();
				}}
            />
			*/ }
			<div className={styles.dropdownIcon}></div>
            <Callout
				styles={{
					root: {
						minWidth: target.current ? target.current.clientWidth : 0,
					}
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
    const { requestTypes } = React.useContext(GlobalContext);

    React.useEffect(() => {
        FeedbackService.getFeedback(props.feedbackId)
            .then((feedback) => {
                setFeedback(feedback);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    if (!feedback) {
        // TODO: replace this with a skeleton loader
        return null;
    }

    const requestType = requestTypes[feedback.Category];

    const iconName = requestType ? requestType.Data.iconName : null;
    let title;
    if (requestType && iconName) {
        title = <Icon iconName={iconName} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <span className={styles.titleText}>
                    {title}
                    {feedback.Title}
                </span>
                <IconButton
                    className={styles.closeButton}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={props.onDismiss}
                />
            </div>
            <div className={styles.body}>
                <div>
                    <p>
                        Status: <EditDropdown />
                    </p>
                    <p>Category: {feedback.Category}</p>
                </div>
                <hr />
                <div>
                    <RichEditor
                        initialCotnent={feedback.Description}
                        editable={false}
                    />
                </div>
            </div>
        </div>
    );
};
