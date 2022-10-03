import { Guid } from '@microsoft/sp-core-library';
import * as React from 'react';
import ITimer from '../../models/ITimer';
import { pauseTimerItem, TimerItem, unPauseTimerItem } from '../TimerItem';
import {
    Movable,
    MoveHandle,
    ITranslate,
    IPositionStyles,
} from '@rast999/react-movable';
import { NoData } from './NoData';
import { IconButton, Text } from 'office-ui-fabric-react';
import styles from './Timer.module.scss';

export interface ITimerProps<T> {
    tasks?: T[];

    /** timer's position */
    top?: number;
    bottom?: number;
    right?: number;
    left?: number;

    /** handle position change */
    onPositionChange?: (
        el: HTMLElement,
        translate: ITranslate,
        positionStyles: IPositionStyles<number>
    ) => void;

    /** reload tasks button handler */
    onSyncTasks?: () => void;

    /** Controlled timer props */
    timers?: ITimer<T>[];
    onTimerAdded?: (timer: ITimer<T>) => void;
    onTimerUpdated?: (timer: ITimer<T>) => void;
    onTimerRemoved?: (timer: ITimer<T>) => void;
    onTimerLogged?: (timer: ITimer<T>) => void;

    /** get task text */
    getTaskText?: (task: T) => string;
    /** get task id */
    getTaskId?: (task: T) => number | string;
}

export const Timer = <T,>(props: React.PropsWithChildren<ITimerProps<T>>) => {
    const [_timers, setTimers] = React.useState<ITimer<T>[]>([]);
    const timers = props.timers || _timers;

    const handleAddTimer = () => {
        const timer = {
            id: Guid.newGuid().toString(),
            duration: 0,
            spot: true,
            active: true,
            lastStartTimestamp: Date.now(),
        };
        if (!props.timers) {
            setTimers((prev) => [
                timer,
                ...prev.map((timer) => pauseTimerItem(timer)),
            ]);
        } else {
            props.onTimerAdded(timer);
            props.timers.forEach((timer) => {
                if (timer.active) {
                    props.onTimerUpdated(pauseTimerItem(timer));
                }
            });
        }
    };

    const handleToggleTimer = (id: string, pause: boolean) => {
        if (!props.timers) {
            setTimers((prev) =>
                prev.map((timer) => {
                    if (timer.id === id) {
                        const result = pause
                            ? pauseTimerItem({ ...timer })
                            : unPauseTimerItem({ ...timer });
                        return result;
                    }
                    // If we un-pause, make sure all other times become paused
                    if (!pause && timer.active) {
                        return pauseTimerItem({
                            ...timer,
                        });
                    }
                    return timer;
                })
            );
        } else {
            props.timers.forEach((timer) => {
                if (timer.id === id) {
                    props.onTimerUpdated(
                        pause
                            ? pauseTimerItem({ ...timer })
                            : unPauseTimerItem({ ...timer })
                    );
                }
                // If we un-pause, make sure all other times become paused
                if (!pause && timer.active) {
                    props.onTimerUpdated(
                        pauseTimerItem({
                            ...timer,
                        })
                    );
                }
            });
        }
    };

    const handleTimerRemoved = React.useCallback((timer: ITimer<T>) => {
        if (!props.timers) {
            setTimers((prev) => prev.filter((t) => t.id !== timer.id));
        } else {
            props.onTimerRemoved(timer);
        }
    }, []);
    
    const handleTimerLogged = React.useCallback((timer: ITimer<T>) => {
        if (!props.timers) {
            handleTimerRemoved(timer);
        } else {
            props.onTimerUpdated(pauseTimerItem(timer));
            props.onTimerLogged(timer);
        }
    }, []); 

    const handleTaskSelect = React.useCallback((timer: ITimer<T>, task: T) => {
        if (!props.timers) {
            setTimers((prev) => prev.map((t) => t.id === timer.id ? {...t, task} : t));
        } else {
            props.onTimerUpdated({ ...timer, task });
        }
    }, []);

    const handleTaskUpdated = React.useCallback((timer: ITimer<T>) => {
        if (!props.timers) {
            setTimers((prev) => prev.map((t) => t.id === timer.id ? timer : t));
        } else {
            props.onTimerUpdated(timer);
        }
    }, []);

    return (
        <Movable
            position="fixed"
            bottom={props.bottom}
            top={props.top}
            left={props.left}
            right={props.right}
            restrictions={{ y: true }}
            style={{ zIndex: 20 }}
            handlePositionChange={props.onPositionChange || (() => null)}
        >
            <div className={`${styles.timer} ${styles.timerBox}`}>
                <MoveHandle className={styles.timerHeaderMoveHandle}>
                    <div className={styles.timerHeader}>
                        <Text variant="medium">Timers</Text>
                        <div>
                            <IconButton
                                iconProps={{
                                    iconName: 'Add',
                                }}
                                title="Add new timer"
                                className={styles.timerHeaderIcon}
                                onClick={handleAddTimer}
                            />
                            {props.onSyncTasks && (
                                <IconButton
                                    iconProps={{
                                        iconName: 'Sync',
                                    }}
                                    title="Sync tasks"
                                    className={styles.timerHeaderIcon}
                                    onClick={props.onSyncTasks}
                                />
                            )}
                        </div>
                    </div>
                </MoveHandle>
                {timers.length > 0 ? (
                    timers.map((timer) => (
                        <TimerItem
                            key={timer.id}
                            item={timer}
                            tasks={props.tasks}
                            onToggle={handleToggleTimer}
                            onRemove={handleTimerRemoved}
                            onLogged={handleTimerLogged}
                            onUpdated={handleTaskUpdated}
                            onTaskSelect={handleTaskSelect}
                            getTaskText={props.getTaskText}
                            getTaskId={props.getTaskId}
                        />
                    ))
                ) : (
                    <NoData />
                )}
            </div>
        </Movable>
    );
};
