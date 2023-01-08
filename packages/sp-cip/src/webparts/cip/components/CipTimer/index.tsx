import { Guid } from '@microsoft/sp-core-library';
import * as React from 'react';
import { timerOptionsHandler, timerAddHandler } from '../../utils/dom-events';
import ITimer from '../../models/ITimer';
import { getDuration, pauseTimerItem } from '../TimerItem';
import { Timer } from '../Timer';
import {
    TIMER_VISIBLE_KEY,
    TIMER_RIGHT_POSITION,
    TIMERS_KEY,
    DIALOG_ID,
    DB_NAME,
    STORE_NAME,
} from '../../utils/constants';
import { hoursFromMilliseconds } from '../../utils/hours-duration';
import useWebStorage from 'use-web-storage-api';
import MainService from '../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import { DefaultButton, PrimaryButton, Stack } from 'office-ui-fabric-react';
import { GlobalContext } from '../../utils/GlobalContext';
import { hideDialog, showDialog } from 'sp-components';
import { TimeLog } from '../TimeLog';
import { openDatabase, removeCached } from 'idb-proxy';

export interface ICipTimerProps {
    // Props go here
}

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
        key: TIMERS_KEY(
            properties.config.rootSite + properties.config.listName
        ),
    });

    /** Setup dom events for showing and hiding the timer */
    React.useEffect(() => {
        async function fetchData(): Promise<void> {
            const service = MainService.getTaskService();
            const tasks = await service.getAll();
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
                return [addedTimer, ...prev.map((t) => pauseTimerItem(t))];
            });
        });
        return () => {
            removeHandler();
            removeAddHandler();
        };
    }, []);

    const handleTimerUpdated = React.useCallback(
        (timer: ITimer<ITaskOverview>) => {
            setTimers((prev) =>
                prev.map((t) => (t.id === timer.id ? timer : t))
            );
        },
        []
    );

    if (!visible) return null;

    return (
        <Timer
            tasks={tasks}
            bottom={5}
            right={right}
            timers={timers}
            onTimerAdded={(timer) => setTimers((prev) => [timer, ...prev])}
            onTimerUpdated={handleTimerUpdated}
            onTimerRemoved={(timer) => {
                showDialog({
                    id: DIALOG_ID,
                    dialogProps: {
                        title: 'Remove timer',
                        subText: 'Deleting timer. Are you sure?',
                    },
                    footer: (
                        <Stack
                            horizontal
                            horizontalAlign="end"
                            tokens={{ childrenGap: 5 }}
                            styles={{ root: { width: 250 } }}
                        >
                            <PrimaryButton
                                onClick={() => {
                                    setTimers((prev) => {
                                        hideDialog(DIALOG_ID);
                                        return prev.filter(
                                            (t) => t.id !== timer.id
                                        );
                                    });
                                }}
                            >
                                Yes
                            </PrimaryButton>
                            <DefaultButton
                                onClick={() => {
                                    hideDialog(DIALOG_ID);
                                }}
                            >
                                No
                            </DefaultButton>
                        </Stack>
                    ),
                });
            }}
            onTimerLogged={(timer) => {
                showDialog({
                    id: DIALOG_ID,
                    dialogProps: {
                        title: 'Log time',
                    },
                    content: (
                        <TimeLog
                            task={timer.task}
                            dialogId={DIALOG_ID}
                            time={hoursFromMilliseconds(getDuration(timer))}
                            description={timer.description}
                            afterLog={() =>
                                setTimers((prev) =>
                                    prev.filter((t) => t.id !== timer.id)
                                )
                            }
                        />
                    ),
                });
            }}
            onPositionChange={(_el, translate, positionStyles) => {
                setRight(-translate.x + (positionStyles?.right || 50));
            }}
            onSyncTasks={async () => {
                try {
                    loadingStart();
                    const service = MainService.getTaskService();
                    const db = await openDatabase(DB_NAME, STORE_NAME);
                    await removeCached(db, /TaskService.*getAll.*/);
                    const tasks = await service.getAll();
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
