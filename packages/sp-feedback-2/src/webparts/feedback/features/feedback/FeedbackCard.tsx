import { DefaultButton, Persona, PersonaSize } from 'office-ui-fabric-react';
import * as React from 'react';
import { IFeedback } from '../../models/IFeedback';
import styles from './FeedbackCard.module.scss';

export const testFeedback: IFeedback = {
    ID: 1,
    Title: 'Test feedback',
    Description: '<p>Test feedback <strong>description</strong></p>',
    Category: 'Bug',
    Status: 'Review',
    Application: 'PLATO',
    DevOpsItems: [],
    Owner: {
        ID: 6,
        Title: 'Dimitrascu Andrei',
        EMail: 'andrei.dimitrascu@gmail.com',
    },
    RemarksBU: '',
    Tags: ['tag1', 'tag2'],
    Country: 'MD',
    Priority: 'Low',
};

export const FeedbackCard: React.FC<{ feedback: IFeedback }> = (props) => {
    const status = props.feedback?.Status.toLowerCase();

    if (!props.feedback) {
        return null;
    }

    return (
        <div
            className={`${styles.container} ${styles['card-content']} ${status}`}
        >
            <div className={styles['card-header']}>
                <table>
                    <tbody>
                        <tr>
                            <td>Title:</td>
                            <td>{props.feedback.Title}</td>
                        </tr>
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
                            <td>Created:</td>
                            <td>12.01.2023</td>
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
                            <td>15.01.2021</td>
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
			<div className={styles.tags}>
				<div className={styles.tag}>Tag1</div>
				<div className={styles.tag}>Tag value</div>
				<div className={styles.tag}>Tag2 value</div>
				<div className={styles.tag}>Tag3 value</div>
				<div className={styles.tag}>Tag4 value</div>
				<div className={styles.tag}>TagN Value</div>
				<div className={styles.tag}>TagN Value</div>
				<div className={styles.tag}>TagN Value</div>
				<div className={styles.tag}>TagN Value</div>
				<div className={styles.tag}>TagN Value</div>
				<div className={styles.tag}>Tag10 Value</div>
			</div>
			<div className={styles.footer}>
				<DefaultButton className={styles.button} iconProps={{ iconName: 'Go' }}>Details</DefaultButton>
				<DefaultButton className={styles.button} iconProps={{ iconName: 'ChevronDown' }}>More</DefaultButton>
			</div>
        </div>
    );
};
