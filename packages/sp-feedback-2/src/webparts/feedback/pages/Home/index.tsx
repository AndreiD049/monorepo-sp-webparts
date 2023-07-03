import * as React from 'react';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';
import { NavigationBar } from '../../components/NavigationBar';
import {
    FeedbackCard,
} from '../../features/feedback/FeedbackCard';
import { ISiteUserInfo } from 'sp-preset';
import { UserService } from '../../features/users/users-service';
import { IFeedback } from '../../models/IFeedback';
import { FeedbackService } from '../../features/feedback/feedback-service';

export interface IHomeProps {
    // Props go here
}

export const Home: React.FC<IHomeProps> = (props) => {
    const [currentUser, setCurrentUser] = React.useState<ISiteUserInfo>(null);
    const [feedbacks, setFeedbacks] = React.useState<IFeedback[]>([]);

    React.useEffect(() => {
        UserService.getCurrentUser().then((user) => {
            setCurrentUser(user);
        }).catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        if (!currentUser) {
            return;
        }

        FeedbackService.getUserFeedbacks(currentUser.Id).then((feedbacks) => {
            setFeedbacks(feedbacks);
        }).catch((err) => console.error(err));
    }, [currentUser]);

    if (!currentUser) {
        return null;
    }

    return (
        <div className={styles.container}>
            <NavigationBar>
                <Link to="/board">Board</Link>
                <Link to="/new">New feedback</Link>
                <Link to="/settings">Settings</Link>
            </NavigationBar>
            <p>Home</p>
            {feedbacks.map((feedback) => (
                <FeedbackCard feedback={feedback} />
            ))}
        </div>
    );
};
