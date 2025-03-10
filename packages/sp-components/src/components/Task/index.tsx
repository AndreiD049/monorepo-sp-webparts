import { Icon, Text, Dropdown, IconButton, IDropdownOption } from '@fluentui/react';
import styles from './Task.module.scss';
import colors from './Colors.module.scss';
import { IUser } from '../../models';
import * as React from 'react';
import { TaskBody } from './TaskBody';
import { TaskPersona } from './DefaultPersona/TaskPersona';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { Pill } from '../Pill';
import { textColor } from 'colored-text';

const CLOSED_ICON = 'ChevronDown';
const OPEN_ICON = 'ChevronUp';
const DROPDOWN_STYLES = {
    caretDownWrapper: {
        display: 'none',
    },
    title: {
        border: 'none',
        height: '1.5em',
        lineHeight: '1.5em',
        minWidth: '100px',
    },
    dropdownItemSelected: {
        minHeight: '1.7em',
        lineHeight: '1.7em',
    },
    dropdownItem: {
        minHeight: '1.7em',
        lineHeight: '1.7em',
    },
    dropdown: {
        fontSize: '.8em',
    },
    dropdownOptionText: {
        fontSize: '.8em',
    },
};
const DROPDOWN_KEYS: { key: string; text: string }[] = [
    {
        key: 'Open',
        text: 'Open',
    },
    {
        key: 'Pending',
        text: 'In progress',
    },
    {
        key: 'Finished',
        text: 'Finished',
    },
    {
        key: 'Cancelled',
        text: 'Cancelled',
    },
];

export interface ITaskInfo {
    description: string;
    title: string;
    user: IUser;
    date: string;
    time: string;
    status: string;
    remark?: string;
    category?: string;
}

export interface ITaskProps {
    info: ITaskInfo;
    expired: boolean;
    isHovering: boolean;
    currentUserId: number;
    canEditOthers: boolean;
    onChange: (ev: {}, option: IDropdownOption | undefined) => void;
    TaskPersona?: JSX.Element;
    className?: string;
    style?: React.CSSProperties;
    theme?: IReadonlyTheme;
    disabled?: boolean;
}

export const Task: React.FC<ITaskProps> = ({
    info,
    expired,
    isHovering,
    currentUserId,
    className = '',
    style = {},
    disabled = false,
    ...props
}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const categoryStyles = React.useMemo(() => textColor(info.category), [info.category]);

    const toggleOpen = React.useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    const body = React.useMemo(() => {
        if (!open) return null;
        return <TaskBody remark={info.remark} description={info.description} />;
    }, [open]);

    const isDisabled = React.useMemo(() => {
        if (disabled) return disabled;
        if (info.user.ID === currentUserId) {
            return false;
        }
        return !props.canEditOthers;
    }, [disabled, info, currentUserId]);

    return (
        <div
            className={`${styles.task} ${colors[info.status.toLowerCase()]} ${className}`}
            style={{
                borderLeftColor: props.theme ? props.theme.palette.themePrimary : 'inherit',
                ...style,
            }}
            tabIndex={0}
            onClick={(ev) => {
                const target = ev.target as HTMLDivElement
                const closestFocusable = target.closest("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") as HTMLElement
                if (closestFocusable) {
                    closestFocusable.focus();
                }
            }}
        >
            <div className={styles.header}>
                {info.remark && (
                    <Icon
                        className={styles['Task__remark-icon']}
                        iconName="InfoSolid"
                        title="Has remark"
                    />
                )}
                <Text
                    className={`${expired && styles.expired} ${styles['Task__title']}`}
                    variant="mediumPlus"
                >
                    {info.title}
                </Text>
                {info.category && (
                    <Pill
                        value={info.category}
                        containerStyles={{
                            display: 'inline-flex',
                        }}
                        style={{
                            color: categoryStyles.fg,
                            backgroundColor: categoryStyles.bg,
                            textAlign: 'center',
                            lineHeight: '.9em',
                            fontSize: '.9em',
                            padding: '.3em 1em',
                            margin: 0,
                        }}
                    />
                )}
                {props.TaskPersona ? (
                    props.TaskPersona
                ) : (
                    <TaskPersona
                        title={info.user.Title}
                        email={info.user.EMail}
                        className={styles.Task_person}
                    />
                )}
            </div>
            <div className={styles.subheader}>
                <Text variant="medium">{info.date}</Text>
                <Text variant="medium" className={styles.hours}>
                    {' '}
                    {info.time}{' '}
                </Text>
            </div>
            <div className={styles.status}>
                <Text variant="medium">Status:</Text>
                <Dropdown
                    options={DROPDOWN_KEYS}
                    styles={DROPDOWN_STYLES}
                    selectedKey={info.status}
                    onChange={
                        info.user.ID === currentUserId || props.canEditOthers
                            ? props.onChange
                            : () => null
                    }
                    disabled={isDisabled}
                />
            </div>
            {info.description || info.remark ? (
                <div className={styles.body}>
                    <IconButton
                        onClick={toggleOpen}
                        iconProps={{
                            iconName: open ? OPEN_ICON : CLOSED_ICON,
                        }}
                    />
                    {body}
                </div>
            ) : null}
        </div>
    );
};

export interface ITaskGroupsProps {
    groupName: string;
    statusMap: { [status: string]: number };
    style?: React.CSSProperties
}

export const TaskGroup: React.FC<ITaskGroupsProps> = (props) => {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen((prev) => !prev);
    };

    return (
        <div className={styles.taskGroup} style={props.style}>
            <Text block variant="mediumPlus" onClick={handleClick} styles={{
                root: {
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'center',
                    gap: '1em',
                }
            }}>
                {props.groupName}
                <Icon iconName={open ? 'ChevronDown' : 'ChevronRight'} />
            </Text>
            <div className={styles.statusLine}>
                <div className={styles.open}>{props.statusMap.Open ?? 0}</div>
                <div className={styles.pending}>{props.statusMap.Pending ?? 0}</div>
                <div className={styles.finished}>{props.statusMap.Finished ?? 0}</div>
                <div className={styles.cancelled}>{props.statusMap.Cancelled ?? 0}</div>
            </div>
            {open && props.children}
        </div>
    );
}
