import * as React from 'react';
import { timerOptionsHandler } from '../../utils/dom-events';
import ITimer from '../../models/ITimer';
import { Timer } from '../Timer';
import { TIMER_VISIBLE_KEY, TIMER_RIGHT_POSITION } from '../../utils/constants';
import useWebStorage from 'use-web-storage-api';
import MainService from '../../services/main-service';
import { HOUR, DB_NAME, STORE_NAME, TIMERS_KEY } from '../../utils/constants';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import { DIALOG_IDS, getDialog } from '../AlertDialog';
import { ButtonType } from 'office-ui-fabric-react';
import { TimeLogGeneral } from '../TimeLogGeneral';
import styles from './CipTimer.module.scss';

export interface ICipTimerProps {
    // Props go here
}

/** Manual indexeddb cache */
const db = new IndexedDbCache(DB_NAME, STORE_NAME, {
    expiresIn: HOUR * 24,
});
const cache = {
    allTasks: db.key('allTasks'),
};

export const CipTimer: React.FC<ICipTimerProps> = (props) => {
    const [visible, setVisible] = useWebStorage<boolean>(true, {
        key: TIMER_VISIBLE_KEY,
    });
    const [left, setLeft] = useWebStorage<number>(50, {
        key: TIMER_RIGHT_POSITION,
    });
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const [timers, setTimers] = useWebStorage<ITimer<ITaskOverview>[]>([], {
        key: TIMERS_KEY,
    });

    /** Setup dom events for showing and hiding the timer */
    React.useEffect(() => {
        async function fetchData() {
            const service = MainService.getTaskService();
            const tasks = await cache.allTasks.get(() => service.getAll());
            setTasks(tasks.filter((t) => !t.FinishDate));
        }
        fetchData().catch((err) => console.error(err));
        const removeHandler = timerOptionsHandler((options) => {
            setVisible(options.visible);
        });
        return removeHandler;
    }, []);

    const handleTimerUpdated = React.useCallback((timer: ITimer<ITaskOverview>) => {
        setTimers((prev) =>
            prev.map((t) => (t.id === timer.id ? timer : t))
        )
    }, [])

    if (!visible) return null;

    return (
        <Timer
            tasks={tasks}
            bottom={5}
            left={left}
            timers={timers}
            onTimerAdded={(timer) => setTimers((prev) => [...prev, timer])}
            onTimerUpdated={handleTimerUpdated}
            onTimerRemoved={async (timer) => {
                const answer = await getDialog({
                    alertId: DIALOG_IDS.MAIN,
                    title: 'Remove timer',
                    subText: 'Deleting timer. Are you sure?',
                    buttons: [
                        {
                            type: ButtonType.primary,
                            key: 'yes',
                            text: 'Yes',
                        },
                        {
                            type: ButtonType.default,
                            key: 'no',
                            text: 'No',
                        },
                    ],
                });
                if (answer === 'yes') {
                    setTimers((prev) => prev.filter((t) => t.id !== timer.id));
                }
            }}
            onTimerLogged={async (timer) => {
                const timeLogged = await getDialog({
                    alertId: DIALOG_IDS.MAIN,
                    title: 'Log time',
                    Component: (
                        <TimeLogGeneral
                            task={timer.task}
                            dialogId={DIALOG_IDS.MAIN}
                            time={10}
                        />
                    ),
                });
                if (timeLogged) {
                    setTimers((prev) => prev.filter((t) => t.id !== timer.id));
                }
            }}
            onPositionChange={(_el, translate, positionStyles) => {
                setLeft(translate.x + (positionStyles?.left || 50));
            }}
            onSyncTasks={async () => {
                try {
                    loadingStart();
                    const service = MainService.getTaskService();
                    await cache.allTasks.remove();
                    const tasks = await cache.allTasks.get(() =>
                        service.getAll()
                    );
                    setTasks(tasks.filter((t) => !t.FinishDate));
                } finally {
                    loadingStop();
                }
            }}
            getTaskText={(task: ITaskOverview) => task.Title}
            getTaskId={(task: ITaskOverview) => task.Id}
        />
    );
};
