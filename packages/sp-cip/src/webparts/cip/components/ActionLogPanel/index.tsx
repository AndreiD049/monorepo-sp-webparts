import { DatePicker, Dropdown, Panel, PanelType } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { HOUR } from '../../utils/constants';
import styles from './ActionLogPanel.module.scss';
import { ActionLogTable } from './ActionLogTable';

export interface IActionLogPanelProps {
    // Props go here
}

export const ActionLogPanel: React.FC<IActionLogPanelProps> = (props) => {
    const [dateFrom, setDateFrom] = React.useState(
        new Date(Date.now() - HOUR * 24 * 7)
    );
    const [dateTo, setDateTo] = React.useState(new Date());
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
                <Dropdown
                    className={styles.headerDropdown}
                    label="User"
                    options={[]}
                />
                <Dropdown
                    className={styles.headerDropdown}
                    label="Action"
                    options={[]}
                />
                <DatePicker
                    label="Date from"
                    value={dateFrom}
                    onSelectDate={(dt) => setDateFrom(dt)}
                    maxDate={new Date(Date.now() - HOUR * 24)}
                />
                <DatePicker
                    label="Date to"
                    value={dateTo}
                    onSelectDate={(dt) => setDateTo(dt)}
                    maxDate={new Date()}
                />
            </div>
            <div className={styles.body}>
                <ActionLogTable 
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                />
            </div>
        </Panel>
    );
};
