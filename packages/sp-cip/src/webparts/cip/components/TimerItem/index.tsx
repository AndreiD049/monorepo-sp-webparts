import { NumericDictionary } from 'lodash';
import * as React from 'react';
import ITimer from '../../models/ITimer';
import { HOUR, MINUTE, SECOND } from '../../utils/constants';
import {
    ITag,
    TagPicker,
    IconButton,
    Text,
    TextField,
    ComboBox,
    Checkbox,
} from 'office-ui-fabric-react';
import styles from './TimerItem.module.scss';

export interface ITimerItemProps<T> {
    item: ITimer<T>;
    onToggle: (id: string, pause: boolean) => void;
    onRemove: (timer: ITimer<T>) => void;
    onLogged: (timer: ITimer<T>) => void;
    onUpdated: (timer: ITimer<T>) => void;
    onTaskSelect: (timer: ITimer<T>, task: T) => void;
    /** tasks */
    tasks: T[];
    /** get task text */
    getTaskText?: (task: T) => string;
    /** get task id */
    getTaskId?: (task: T) => number | string;
}

interface ITimerDuration {
    hours: number;
    minutes: number;
    seconds: number;
}

export function pauseTimerItem<T>(item: ITimer<T>): ITimer<T> {
    if (!item.active) return item;
    // set not active
    item.active = false;
    // update duration
    item.duration += Date.now() - item.lastStartTimestamp;
    return item;
}

export function unPauseTimerItem<T>(item: ITimer<T>): ITimer<T> {
    if (item.active) return item;
    item.active = true;
    item.lastStartTimestamp = Date.now();
    return item;
}

const calculatePassedTime = (passedMills: number) => {
    // First, calculate how many full hours passed, and keep the remainder
    const hours = Math.floor(passedMills / HOUR);
    let remainder = passedMills - HOUR * hours;
    // then, how many full minutes passed from the remainder, keep the remainder
    const minutes = Math.floor(remainder / MINUTE);
    remainder = remainder - MINUTE * minutes;
    // then, calculate seconds and round to the nearest integer
    const seconds = Math.round(remainder / SECOND);
    return {
        hours,
        minutes,
        seconds,
    };
};

const formatPassedDuration = (duration: ITimerDuration) => {
    const hours = `${duration.hours < 10 ? '0' : '0'}${duration.hours}`;
    const minutes = `${duration.minutes < 10 ? '0' : ''}${duration.minutes}`;
    const seconds = `${duration.seconds < 10 ? '0' : ''}${duration.seconds}`;
    return `${hours}:${minutes}:${seconds}`;
};

const advanceDuration = (duration: ITimerDuration) => {
    const clone = { ...duration };
    clone.seconds += 1;
    if (clone.seconds >= 60) {
        clone.seconds -= 60;
        clone.minutes += 1;
    }
    if (clone.minutes >= 60) {
        clone.minutes -= 60;
        clone.hours += 1;
    }
    return clone;
};

export function TimerItem<T>(props: ITimerItemProps<T>) {
    const [timerDuration, setTimerDuration] = React.useState<ITimerDuration>({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const timerRef = React.useRef<number>(0);
    const getTaskText = props.getTaskText || ((task: T) => task.toString());
    const getTaskId = props.getTaskId || ((task: T) => task['Id']);

    const createTagFromTask = (item: T) => {
        return {
            key: props.getTaskId(item),
            name: props.getTaskText(item),
        };
    };

    /**
     * If timer is active, we will count seconds from start timestamp
     */
    React.useEffect(() => {
        if (props.item.active) {
            const now = Date.now();
            const passed =
                props.item.duration + now - props.item.lastStartTimestamp;
            setTimerDuration(calculatePassedTime(passed));
            timerRef.current = setInterval(() => {
                setTimerDuration((prev) => advanceDuration(prev));
            }, 1000);
        } else {
            setTimerDuration(calculatePassedTime(props.item.duration));
        }
        return () => clearInterval(timerRef.current);
    }, [props.item.active]);

    return (
        <div className={`${styles.container} ${props.item.active ? styles.activeTimer : ''}`}>
            <IconButton
                iconProps={{
                    iconName: props.item.active ? 'pause' : 'play',
                }}
                onClick={() => props.onToggle(props.item.id, props.item.active)}
            />
            <Text className={styles.timerDuration} variant="smallPlus">
                {formatPassedDuration(timerDuration)}
            </Text>
            { props.item.spot ? (
                <TextField 
                    placeholder="Spot task description..."
                    value={props.item.description}
                    onChange={(_ev, value) => props.onUpdated({ ...props.item, description: value })}
                />
            ) : (
                <TagPicker
                    inputProps={{
                        placeholder: 'No task: SPOT',
                    }}
                    selectedItems={
                        props.item.task
                            ? [createTagFromTask(props.item.task)]
                            : []
                    }
                    onEmptyResolveSuggestions={(selected) => {
                        return props.tasks.map((t) => createTagFromTask(t));
                    }}
                    onResolveSuggestions={(filter) =>
                        props.tasks
                            .filter((t) =>
                                getTaskText(t)
                                    .toLowerCase()
                                    .includes(filter.toLowerCase())
                            )
                            .map((t) => createTagFromTask(t))
                    }
                    onChange={(items) => {
                        let task = null;
                        if (items.length > 0) {
                            task = props.tasks.find(
                                (t) => props.getTaskId(t) === items[0].key
                            );
                        }
                        props.onTaskSelect(props.item, task);
                    }}
                    itemLimit={1}
                />
            )}
            <Checkbox
                disabled={Boolean(props.item.task)}
                label="Spot"
                checked={props.item.spot}
                onChange={(_ev: {}, checked: boolean) => props.onUpdated({ ...props.item, spot: checked, description: null })}
                styles={{
                    checkbox: {
                        height: '1.1em',
                        width: '1.1em',
                    },
                    label: {
                        fontSize: '.9em',
                        alignItems: 'center',
                    },
                }}
            />
            <IconButton
                iconProps={{
                    iconName: 'Timer',
                }}
                onClick={() => props.onLogged(props.item)}
            />
            <IconButton
                iconProps={{
                    iconName: 'ChromeClose',
                }}
                onClick={() => props.onRemove(props.item)}
            />
        </div>
    );
}
