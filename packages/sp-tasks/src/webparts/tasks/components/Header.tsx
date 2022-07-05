import { debounce } from '@microsoft/sp-lodash-subset';
import { SearchBox } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import { IUser } from '../models/IUser';
import GlobalContext from '../utils/GlobalContext';
import DateSelector from './DateSelector';
import styles from './Tasks.module.scss';
import UserSelctor from './user-selector/UserSelector';

export interface IHeaderProps {
    date: Date;
    loading: boolean;
    setLoading: (value: boolean) => void;
    setDate: (value: Date) => void;
    selectedUsers: IUser[];
    setSelectedUsers: any;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const Header: FC<IHeaderProps> = (props) => {
    const { maxPeople } = React.useContext(GlobalContext);

    const handleSearch = debounce((ev, newValue: string) => props.setSearch(newValue.toLowerCase()), 1000);

    return (
        <div className={styles.commandbar}>
            <div className={styles.commandbar_left}></div>
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
                    <UserSelctor
                        users={props.selectedUsers}
                        setUsers={props.setSelectedUsers}
                        className={styles.userSelector}
                    />
                ) : null}
            </div>
            <div className={styles.commandbar_right}>
                <SearchBox
                    styles={{ root: { width: 200 }}}
                    placeholder="Search task"
                    onChange={handleSearch}
                />
            </div>
        </div>
    );
};

export default Header;
