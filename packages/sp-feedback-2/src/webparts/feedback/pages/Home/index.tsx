import * as React from 'react';
import { ISiteUserInfo } from 'sp-preset';
import { UserService } from '../../features/users/users-service';
import { IFeedback } from '../../models/IFeedback';
import { FeedbackService } from '../../features/feedback/feedback-service';
import styles from './Home.module.scss';
import { IconButton } from 'office-ui-fabric-react';
import { useSearchParams } from 'react-router-dom';
import { Identifier, on } from '../../features/events';
import { HomeBarChart } from './HomeBarChart';

export interface IHomeProps {
    // Props go here
}

export const Home: React.FC<IHomeProps> = () => {
    const [currentUser, setCurrentUser] = React.useState<ISiteUserInfo>(null);
    const [, setSearchParams] = useSearchParams();
    const [feedbacks, setFeedbacks] = React.useState<IFeedback[]>([]);

    React.useEffect(() => {
        UserService.getCurrentUser()
            .then((user) => {
                setCurrentUser(user);
            })
            .catch((err) => console.error(err));
    }, []);

	// Handle update event
	React.useEffect(() => {
		on<Identifier<Partial<IFeedback>>>('feedback-updated', (ev) => {
			const { id, value } = ev.detail;
			setFeedbacks((prev) => {
				return prev.map((feedback) => {
					if (feedback.ID === id) {
						return {
							...feedback,
							...value,
						};
					}
					return feedback;
				});
			});
		});
	}, []);

		

    React.useEffect(() => {
        if (!currentUser) {
            return;
        }

        FeedbackService.getUserFeedbacks(currentUser.Id)
            .then((feedbacks) => {
                setFeedbacks(feedbacks);
            })
            .catch((err) => console.error(err));
    }, [currentUser]);

    if (!currentUser) {
        return null;
    }

    return (
        <div className={styles.container}>
            {/*
             * The screen is divided into 2 sections
             * On the left: a list of all user's feedbacks, sorted by Creation date, descending
             * On the right: a summary of feedbacks (a chart maybe?) with some dropdowns where
             * user can see how many feedbacks he added and what is the status (per app, category, etc..)
             *
             * Ideas for other sections??
             *	- Recent changes on my feedbacks (comments, status changes, etc)
             *	- A section with all feedbacks that are being worked on (status = In Progress/Implementing).
             * 	This to give the user an understanding what is the focus of the teams at the moment
             *	- A section with recently implemented feedbacks. So that user knows what he can expect
             *	to be implemented soon
             *	- A section to Explore feedbacks by keywords, categories, apps, etc..
             *	User should be able to see feedbacks left by other people and note the ones that will
             *	be beneficial for his own use case.
             */}
            <h2 style={{ textAlign: 'center' }}>My feedbacks</h2>
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'stretch',
                    margin: '1em',
                    maxHeight: 500,
                }}
            >
                <div
                    className={`${styles.border} ${styles.grow}`}
                    style={{ minWidth: 500, overflow: 'auto', backgroundColor: '#fff' }}
                >
                    <ul className={styles.feedbackList}>
                        {feedbacks.map((feedback, idx) => (
                            <li key={feedback.ID}>
                                <span data-type="index">{idx + 1}</span>
                                <span
                                    style={{
                                        backgroundColor: 'lightgray',
                                        borderRadius: '4px',
                                        marginRight: '4px',
                                        padding: '2px 4px',
                                    }}
                                >
                                    {feedback.Status}
                                </span>
                                <span data-type="title" className={styles.grow}>
                                    {feedback.Title}
                                </span>
                                <span data-type="created-date">
                                    Created:{' '}
                                    {new Date(
                                        feedback.Created
                                    ).toLocaleDateString()}
                                </span>
                                <span data-type="goto">
                                    <IconButton
                                        onClick={() => {
                                            setSearchParams((prev) => {
                                                const id = feedback.ID.toString();
                                                prev.set('feedback', id);
                                                return prev;
                                            });
                                        }}
                                        iconProps={{
                                            iconName: 'OpenInNewWindow',
                                        }}
                                    />
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div
                    className={`${styles.border}`}
                    style={{ borderLeft: 'none', backgroundColor: '#fff', minWidth: '40%' }}
                >
					<HomeBarChart feedbacks={feedbacks} />
                </div>
            </div>

            {/* Recent activity */}
            <h2 style={{ textAlign: 'center' }}>Recent activity</h2>
        </div>
    );
};
