import { Icon, Text } from '@fluentui/react';
import * as React from 'react';
import { ActionLogTime } from '../components/ActionLogTime';
import { formatHours } from '../utils/hours-duration';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import {
    ActionType,
    IAction,
} from '@service/sp-cip/dist/services/action-service';
import styles from './ActionLog.module.scss';
import { getTimeLogTokens } from 'sp-components';

export interface IActionLogItemProps {
    action: IAction;
    task: ITaskOverview;
}

export const getActionIconName = (type: ActionType): string => {
    switch (type) {
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
        case 'Responsible':
            return 'FollowUser';
        case 'Priority':
            return 'FavoriteStarFill';
        case 'Time log':
            return 'Stopwatch';
        case 'Progress':
            return 'CalculatorPercentage';
        case 'Comment':
            return 'Comment';
        default:
            return 'ProgressLoopOuter';
    }
};

const formatToken = (token: string, itemType: ActionType): string => {
    switch (itemType) {
        case 'Due date':
            return new Date(token).toLocaleDateString();
        case 'Estimated time':
        case 'Time log':
            return `${formatHours(Number.parseFloat(token))} hour(s)`;
        default:
            return token;
    }
};

export const getActionComment = (action: IAction): JSX.Element => {
    let content: JSX.Element = null;
    const tokens = action.Comment?.split('|');
    const arrow = (
        <Icon style={{ margin: '0 .5em' }} iconName="DoubleChevronRight8" />
    );
    const style = {
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'center',
    };
    const timeLogTokens = action.ActivityType === 'Time log' ? getTimeLogTokens(action.Comment) : null;

    switch (action.ActivityType) {
        case 'Due date':
        case 'Estimated time':
        case 'Priority':
        case 'Responsible':
        case 'Status':
            if (tokens.length > 1) {
                content = (
                    <div style={style}>
                        <span>
                            {formatToken(tokens[0], action.ActivityType)}
                        </span>
                        {arrow}
                        <span>
                            {formatToken(tokens[1], action.ActivityType)}
                        </span>
                    </div>
                );
            }
            break;
        case 'Time log':
            content = (
                <div>
                    <div>{formatToken(timeLogTokens.time.toString(), action.ActivityType)}</div>
                    <p>{timeLogTokens.comment}</p>
                </div>
            );
            break;
        default:
            content = <span>{action.Comment}</span>;
            break;
    }

    return content;
};

const ActionIcon: React.FC<{ type: ActionType }> = (props) => {
    const name = React.useMemo(
        () => getActionIconName(props.type),
        [props.type]
    );

    return (
        <div className={styles.actionLogItem__icon}>
            <Icon iconName={name} />
        </div>
    );
};

const ActionItemContent: React.FC<IActionLogItemProps> = (props) => {
    let text = props.action.ActivityType + ' update: ';
    switch (props.action.ActivityType) {
        case 'Created':
        case 'Finished':
            text = props.action.ActivityType;
            break;
    }
    const content = React.useMemo(() => {
        switch (props.action.ActivityType) {
            case 'Time log':
                return (
                    <ActionLogTime action={props.action} task={props.task} />
                );
            default:
                return (
                    <div
                        style={{
                            display: 'flex',
                            flexFlow: 'row',
                            gap: '.5em',
                        }}
                    >
                        <span>{text}</span>
                        <span>{getActionComment(props.action)}</span>
                    </div>
                );
        }
    }, []);

    return <Text variant="medium">{content}</Text>;
};

export const ActionLogItem: React.FC<IActionLogItemProps> = (props) => {
    return (
        <div className={styles.actionLogItem}>
            <ActionIcon type={props.action.ActivityType} />
            <div className={styles.actionLogItem__content}>
                <div>
                    <ActionItemContent {...props} />
                </div>
                <div className={styles.actionLogItem__signature}>
                    {props.action.User?.Title || props.action.Author.Title} -{' '}
                    {props.action.Date
                        ? new Date(props.action.Date).toLocaleTimeString()
                        : new Date(props.action.Created).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};
