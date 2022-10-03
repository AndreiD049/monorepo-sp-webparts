import { Guid } from '@microsoft/sp-core-library';
import * as React from 'react';
import { timerOptionsHandler, timerAddHandler } from '../../utils/dom-events';
import ITimer from '../../models/ITimer';
import { getDuration, pauseTimerItem } from '../TimerItem';
import { Timer } from '../Timer';
import { TIMER_VISIBLE_KEY, TIMER_RIGHT_POSITION,  HOUR, DB_NAME, STORE_NAME, TIMERS_KEY  } from '../../utils/constants';
import { hoursFromMilliseconds } from '../../utils/hours-duration';
import useWebStorage from 'use-web-storage-api';
import MainService from '../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import { DIALOG_IDS, getDialog } from '../AlertDialog';
import { ButtonType, portalContainsElement } from 'office-ui-fabric-react';
import { TimeLogGeneral } from '../TimeLogGeneral';
import { GlobalContext } from '../../utils/GlobalContext';
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

const newTimer = (task?: ITaskOverview): ITimer<ITaskOverview> => ({
    id: Guid.newGuid().toString(),
    task,
    spot: Boolean(task) === false,
    description: '',
    active: true,
    duration: 0,
    lastStartTimestamp: Date.now(),
});

export const CipTimer: React.FC<ICipTimerProps> = (props) => {
    const { properties } = React.useContext(GlobalContext);
    const [visible, setVisible] = useWebStorage<boolean>(true, {
        key: TIMER_VISIBLE_KEY,
    });
    const [right, setRight] = useWebStorage<number>(50, {
        key: TIMER_RIGHT_POSITION,
    });
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const [timers, setTimers] = useWebStorage<ITimer<ITaskOverview>[]>([], {
        key: TIMERS_KEY(properties.config.rootSite + properties.config.listName),
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
        const removeAddHandler = timerAddHandler((options) => {
            const addedTimer = newTimer(options.task);
            setTimers((prev) => {
                console.log(prev);
                return [addedTimer, ...(prev.map((t) => pauseTimerItem(t)))];
            });
        });
        return () => {
            removeHandler();
            removeAddHandler();
        };
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
            right={right}
            timers={timers}
            onTimerAdded={(timer) => setTimers((prev) => [timer, ...prev])}
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
                            time={hoursFromMilliseconds(getDuration(timer))}
                            description={timer.description}
                        />
                    ),
                });
                if (timeLogged) {
                    setTimers((prev) => prev.filter((t) => t.id !== timer.id));
                }
            }}
            onPositionChange={(_el, translate, positionStyles) => {
                setRight(-translate.x + (positionStyles?.right || 50));
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
