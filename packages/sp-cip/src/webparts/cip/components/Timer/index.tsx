import { Guid } from '@microsoft/sp-core-library';
import * as React from 'react';
import ITimer from '../../models/ITimer';
import { pauseTimerItem, TimerItem, unPauseTimerItem } from '../TimerItem';
import styles from './Timer.module.scss';

export interface ITimerProps {
    // Props go here
}

export const Timer: React.FC<ITimerProps> = (props) => {
    const [timers, setTimers] = React.useState<ITimer[]>([]);

    const handleAddTimer = () => {
        setTimers((prev) => [
            {
                id: Guid.newGuid().toString(),
                duration: 0,
                active: true,
                lastStartTimestamp: Date.now(),
            },
            ...prev.map((timer) => pauseTimerItem(timer)),
        ]);
    };

    const handleToggleTimer = (id: string, pause: boolean) => {
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
    };

    return (
        <div className={`${styles.timer} ${styles.timerBox}`}>
            <button onClick={handleAddTimer}>Add new timer</button>
            {timers.map((timer) => (
                <TimerItem
                    key={timer.id}
                    item={timer}
                    onToggle={handleToggleTimer}
                />
            ))}
        </div>
    );
};
