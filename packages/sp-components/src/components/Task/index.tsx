import { Icon, Text, Dropdown, IconButton, IDropdownOption } from 'office-ui-fabric-react';
import styles from './Task.module.scss';
import { IUser, IUserDetails } from '../models';
import * as React from 'react';
import { TaskBody } from './TaskBody';
import { TaskPersona } from './DefaultPersona/TaskPersona';

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
}

export interface ITaskProps {
    info: ITaskInfo;
    expired: boolean;
    isHovering: boolean;
    currentUser: IUserDetails;
    canEditOthers: boolean;
    onChange: (ev: {}, option: IDropdownOption | undefined) => void;
    TaskPersona?: JSX.Element;
}

export const Task: React.FC<ITaskProps> = ({ info, expired, isHovering, currentUser, ...props }) => {
    const [open, setOpen] = React.useState<boolean>(false);

    const toggleOpen = React.useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    const body = React.useMemo(() => {
        if (!open) return null;
        return <TaskBody remark={info.remark} description={info.description} />;
    }, [open]);

    return (
        <>
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
                        info.user.ID === currentUser.User.ID || props.canEditOthers
                            ? props.onChange
                            : () => null
                    }
                    disabled={info.user.ID === currentUser.User.ID ? false : !props.canEditOthers}
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
        </>
    );
};
