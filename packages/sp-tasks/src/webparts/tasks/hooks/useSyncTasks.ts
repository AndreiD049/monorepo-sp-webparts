import * as React from 'react';
import { useVisibility } from 'react-visibility-hook';
import { MINUTE } from '../utils/constants';
import GlobalContext from '../utils/GlobalContext';

export default function useSyncTasks(date: Date, userIds: number[]) {
    const { taskSyncService, taskLogSyncService } = React.useContext(GlobalContext);
    const visibility = useVisibility();
    const [update, setUpdate] = React.useState(false);
    const timeout = MINUTE * 2;

    React.useEffect(() => {
        // aquire the change token on start
        taskLogSyncService.didRecordsChangedOnDate(date, userIds);
        taskSyncService.didRecordsChanged(userIds);
    }, []);

    const checkSync = React.useCallback(async () => {
        if (visibility.visible) {
            const logsChanged = await taskLogSyncService.didRecordsChangedOnDate(
                date,
                userIds
            );
            const tasksChanged = await taskSyncService.didRecordsChanged(userIds);
            if (logsChanged || tasksChanged) {
                setUpdate((prev) => !prev);
            }
        }
    }, [visibility, date, userIds]);

    React.useEffect(() => {
        if (visibility.visible && visibility.sinceLastVisible() >= timeout) {
            checkSync();
        }
        const timer = setInterval(checkSync, timeout);
        return () => clearInterval(timer);
    }, [visibility]);

    return update;
}
