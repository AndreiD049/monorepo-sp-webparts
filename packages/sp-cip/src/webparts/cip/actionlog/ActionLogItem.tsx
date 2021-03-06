import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ActionType, IAction } from '../comments/useActions';
import Pill from '../components/Pill/Pill';
import { GlobalContext } from '../utils/GlobalContext';
import styles from './ActionLog.module.scss';

export interface IActionLogItemProps {
    action: IAction;
}

const ActionIcon: React.FC<{ type: ActionType }> = (props) => {
    const name = React.useMemo(() => {
        switch (props.type) {
            case 'Created':
                return 'BuildDefinition';
            case 'Finished':
                return 'IconSetsFlag';
            case 'Estimated time':
                return 'DateTime';
            case 'Due date':
                return 'Calendar';
            case 'Status':
                return 'SyncStatus';
            case 'Responisble':
                return 'FollowUser';
            case 'Priority':
                return 'FavoriteStarFill';
            case 'Time log':
                return 'Stopwatch';
            case 'Progress':
                return 'CalculatorPercentage';
            default:
                return 'ProgressLoopOuter';
        }
    }, [props.type]);

    return (
        <div className={styles['actionLogItem__icon']}>
            <Icon iconName={name} />
        </div>
    );
};

const ActionItemContent: React.FC<IActionLogItemProps> = (props) => {
    const content = React.useMemo(() => {
        switch (props.action.ActivityType) {
            case 'Created':
                return (
                    <span className={styles['actionLogItem__value_highlighted']}>
                        <Text variant="medium">{'Task created'}</Text>
                    </span>
                );
            case 'Finished':
                return (
                    <span
                        className={styles['actionLogItem__value_highlighted']}
                    >
                        <Text variant="medium">{'Task finished'}</Text>
                    </span>
                );
            case 'Estimated time':
                return (
                    <span
                        className={styles['actionLogItem__value_highlighted']}
                    >
                        <Text variant="medium">
                            {'Estimated required time: '}
                            {props.action.Comment.split('|')[0] + ' hours'}
                            {' to '}
                            {props.action.Comment.split('|')[1] + ' hours'}
                        </Text>
                    </span>
                );
            case 'Due date':
                return (
                    <span
                        className={styles['actionLogItem__value_highlighted']}
                    >
                        <Text variant="medium">
                            {'Due date: '}
                            {new Date(
                                props.action.Comment.split('|')[0]
                            ).toLocaleDateString()}
                            {' to '}
                            {new Date(
                                props.action.Comment.split('|')[1]
                            ).toLocaleDateString()}
                        </Text>
                    </span>
                );
            case 'Status':
                return (
                    <span
                        className={styles['actionLogItem__value_highlighted']}
                    >
                        <Text variant="medium">
                            {'Status: '}
                            {props.action.Comment.split('|')[0]}
                            {' to '}
                            {props.action.Comment.split('|')[1]}
                        </Text>
                    </span>
                );
            case 'Responisble':
                return (
                    <span
                        className={styles['actionLogItem__value_highlighted']}
                    >
                        <Text variant="medium">
                            {'Responsible: '}
                            {props.action.Comment.split('|')[0]}
                            {' to '}
                            {props.action.Comment.split('|')[1]}
                        </Text>
                    </span>
                );
            case 'Priority':
                return (
                    <span
                        className={styles['actionLogItem__value_highlighted']}
                    >
                        <Text variant="medium">
                            {'Priority: '}
                            {props.action.Comment.split('|')[0]}
                            {' to '}
                            {props.action.Comment.split('|')[1]}
                        </Text>
                    </span>
                );
            case 'Time log':
                return <>Logged {props.action.Comment}</>;
            case 'Progress':
                return (
                    <span
                        className={styles['actionLogItem__value_highlighted']}
                    >
                        <Text variant="medium">
                            Progress: {props.action.Comment}
                        </Text>
                    </span>
                );
            default:
                return <>props.action.ActivityType</>;
        }
    }, []);

    return <Text variant="medium">{content}</Text>;
};

export const ActionLogItem: React.FC<IActionLogItemProps> = (props) => {
    return (
        <div className={styles['actionLogItem']}>
            <ActionIcon type={props.action.ActivityType} />
            <div className={styles['actionLogItem__content']}>
                <div>
                    <ActionItemContent {...props} />
                </div>
                <div className={styles['actionLogItem__signature']}>
                    {props.action.Author.Title} -{' '}
                    {new Date(props.action.Created).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};
