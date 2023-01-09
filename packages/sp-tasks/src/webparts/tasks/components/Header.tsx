import { debounce } from '@microsoft/sp-lodash-subset';
import { ActionButton, PanelType, SearchBox } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import { createPanel } from '../hooks/usePanel';
import { IUser } from '../models/IUser';
import GlobalContext from '../utils/GlobalContext';
import DateSelector from './DateSelector/DateSelector';
import { CreateTasks } from './panels/CreateTasks';
import styles from './Tasks.module.scss';
import UserTeamSelctor from './user-selector/UserTeamSelector';

export interface IHeaderProps {
    date: Date;
    loading: boolean;
    setLoading: (value: boolean) => void;
    setDate: (value: Date) => void;
    selectedUsers: IUser[];
    setSelectedUsers: React.Dispatch<React.SetStateAction<IUser[]>>;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const Header: FC<IHeaderProps> = (props) => {
    const { maxPeople, canEditOthers } = React.useContext(GlobalContext);

    const handleSearch = debounce(
        (_ev, newValue: string) => props.setSearch(newValue.toLowerCase()),
        1000
    );

    let leftContents: JSX.Element = null;
    if (canEditOthers) {
        leftContents = (
            <ActionButton
                onClick={() => {
                    createPanel('SP_TASKS', {
                        isOpen: true,
                        isLightDismiss: true,
                        headerText: 'Create tasks',
                        allowTouchBodyScroll: true,
                        type: PanelType.large,
                        PanelContents: <CreateTasks />,
                    });
                }}
                iconProps={{ iconName: 'Add' }}
            >
                Create tasks
            </ActionButton>
        );
    }

    return (
        <div className={styles.commandbar}>
            <div className={styles.commandbar_left}>{leftContents}</div>
            <div className={styles.commandbar_middle}>
                <DateSelector
                    date={props.date}
                    setDate={(val) => {
                        props.setLoading(true);
                        props.setDate(val);
                    }}
                    loading={props.loading}
                    className={styles.selector}
                />
                {maxPeople > 0 ? (
                    <UserTeamSelctor
                        users={props.selectedUsers}
                        setUsers={props.setSelectedUsers}
                        className={styles.userSelector}
                    />
                ) : null}
            </div>
            <div className={styles.commandbar_right}>
                <SearchBox
                    styles={{ root: { width: 200 } }}
                    placeholder="Search task"
                    onChange={handleSearch}
                />
            </div>
        </div>
    );
};

export default Header;
