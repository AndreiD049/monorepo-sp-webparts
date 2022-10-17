import { ActionType } from '@service/sp-cip/dist/services/action-service';
import {
    Calendar,
    DatePicker,
    DateRangeType,
    DayOfWeek,
    Panel,
    PanelType,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { DAY, SELECTED_USERS_KEY } from '../../utils/constants';
import { defaultCalendarStrings } from '../utils/defaultCalendarStrings';
import { ActionDropdown } from './ActionDropdown';
import { ActionLogTable } from './ActionLogTable';
import useWebStorage from 'use-web-storage-api';
import { PeoplePicker } from './PeoplePicker';
import styles from './ActionLogPanel.module.scss';
import { AlertDialog, DIALOG_IDS } from '../AlertDialog';

export interface IActionLogPanelProps {
    // Props go here
}

export type ActionDropdownOption = ActionType | 'All';

export const ActionLogPanel: React.FC<IActionLogPanelProps> = (props) => {
    const [monday, sunday] = React.useMemo(() => {
        const today = new Date();
        const mon = new Date(today.getTime() - (today.getDay() - 1) * DAY);
        const sun = new Date(today.getTime() + (7 - today.getDay()) * DAY);
        return [mon, sun];
    }, []);
    const [dateFrom, setDateFrom] = React.useState(monday);
    const [dateTo, setDateTo] = React.useState(sunday);
    const [action, setAction] = React.useState<ActionDropdownOption>('All');
    const [selectedUsers, setSelectedUsers] = useWebStorage([], {
        key: location.origin + SELECTED_USERS_KEY,
    });

    const navigate = useNavigate();
    const handleDismissPanel = React.useCallback(() => navigate('/'), []);

    return (
        <Panel
            isOpen={true}
            onDismiss={handleDismissPanel}
            type={PanelType.large}
            isLightDismiss
            headerText="Action log"
        >
            <div className={styles.header}>
                <PeoplePicker
                    selectedUsers={selectedUsers}
                    onUsersSelected={(users) => setSelectedUsers(users)}
                />
                <ActionDropdown
                    selectedAction={action}
                    onActionChange={(action) => setAction(action)}
                />
                <DatePicker
                    label="Week"
                    allowTextInput
                    textField={{
                        value:
                            dateFrom &&
                            dateTo &&
                            `${dateFrom.toLocaleDateString()} - ${dateTo.toLocaleDateString()}`,
                    }}
                    calendarAs={() => (
                        <Calendar
                            dateRangeType={DateRangeType.Week}
                            value={dateFrom}
                            onSelectDate={(_dt, dates) => {
                                setDateFrom(dates[0]);
                                setDateTo(dates[dates.length - 1]);
                            }}
                            firstDayOfWeek={DayOfWeek.Monday}
                            showWeekNumbers
                            strings={defaultCalendarStrings}
                        />
                    )}
                />
            </div>
            <div className={styles.body}>
                <ActionLogTable
                    selectedUsersIds={selectedUsers.map((u) => u.id)}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    action={action}
                />
            </div>
            <AlertDialog alertId={DIALOG_IDS.ACTIONLOG_PANEL} />
        </Panel>
    );
};
