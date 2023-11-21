import { DefaultButton, Persona, PersonaSize } from 'office-ui-fabric-react';
import * as React from 'react';
import { IFeedback } from '../../models/IFeedback';
import styles from './FeedbackCard.module.scss';

export const FeedbackCard: React.FC<{ feedback: IFeedback }> = (props) => {
    const status = props.feedback?.Status.toLowerCase();

    if (!props.feedback) {
        return null;
    }

    let tags;
    if (props.feedback.Tags && props.feedback.Tags.length > 0) {
        tags = (
            <div className={styles.tags}>
                {props.feedback.Tags.map((tag, index) => (
                    <div key={index} className={styles.tag}>
                        #{tag}
                    </div>
                ))}
            </div>
        );
    }

    let owner = (
		<Persona
			title="No owner"
			text="No owner"
			imageUrl='/_layouts/15/userphoto.aspx?AccountName=unknown&Size=M'
			size={PersonaSize.size24}
		/>
	)
    if (props.feedback.Owner) {
        owner = (
            <Persona
                title={props.feedback.Owner.Title}
                text={props.feedback.Owner.Title}
                imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${props.feedback.Owner?.EMail}&Size=M`}
                size={PersonaSize.size24}
            />
        );
    }

    return (
        <div
            className={`${styles.container} ${styles['card-content']} ${status}`}
        >
            <div className={styles['card-title']}>{props.feedback.Title}</div>
            <div className={styles['card-header']}>
                <table>
                    <tbody>
                        <tr>
                            <td>System:</td>
                            <td>{props.feedback.Application}</td>
                        </tr>
                        <tr>
                            <td>Status:</td>
                            <td>{props.feedback.Status}</td>
                        </tr>
                        <tr>
                            <td>Category:</td>
                            <td>{props.feedback.Category}</td>
                        </tr>
                    </tbody>
                </table>
                <table>
                    <tbody>
                        <tr>
                            <td>Owner:</td>
                            <td>{owner}</td>
                        </tr>
                        <tr>
                            <td>Created:</td>
                            <td>
                                {new Date(
                                    props.feedback.Created
                                ).toLocaleDateString()}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'end' }}>By:</td>
                            <td>
                                <Persona
                                    title="Andrei Dimitrascu"
                                    text="Andrei Dimitrascu"
                                    imageUrl={`/_layouts/15/userphoto.aspx?AccountName=andrei.dimitrascu@devadmintools.onmicrosoft.com&Size=M`}
                                    size={PersonaSize.size24}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Modified:</td>
                            <td>
                                {new Date(
                                    props.feedback.Modified
                                ).toLocaleDateString()}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'end' }}>By:</td>
                            <td>
                                <Persona
                                    title="Andrei Dimitrascu"
                                    text="Andrei Dimitrascu"
                                    imageUrl={`/_layouts/15/userphoto.aspx?AccountName=andrei.dimitrascu@devadmintools.onmicrosoft.com&Size=M`}
                                    size={PersonaSize.size24}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {tags}
            <div className={styles.footer}>
                <DefaultButton
                    className={styles.button}
                    iconProps={{ iconName: 'Go' }}
                >
                    Details
                </DefaultButton>
                <DefaultButton
                    className={styles.button}
                    iconProps={{ iconName: 'ChevronDown' }}
                >
                    More
                </DefaultButton>
            </div>
        </div>
    );
};
