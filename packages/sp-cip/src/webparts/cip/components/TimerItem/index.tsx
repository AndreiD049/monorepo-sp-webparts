import * as React from 'react';
import ITimer from '../../models/ITimer';
import { HOUR, MINUTE, SECOND } from '../../utils/constants';
import {
    TagPicker,
    IconButton,
    Text,
    TextField,
    Checkbox,
} from '@fluentui/react';
import { useVisibility } from 'react-visibility-hook';
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

const calculatePassedTime = (passedMills: number): ITimerDuration => {
    // First, calculate how many full hours passed, and keep the remainder
    const hours = Math.floor(passedMills / HOUR);
    let remainder = passedMills - HOUR * hours;
    // then, how many full minutes passed from the remainder, keep the remainder
    const minutes = Math.floor(remainder / MINUTE);
    remainder = remainder - MINUTE * minutes;
    // then, calculate seconds and round to the nearest integer
    const seconds = Math.floor(remainder / SECOND);
    return {
        hours,
        minutes,
        seconds,
    };
};

/* format passed duration like 'hh:mm:ss' */
const formatPassedDuration = (duration: ITimerDuration): string => {
    const hours = `${duration.hours < 10 ? '0' : ''}${duration.hours}`;
    const minutes = `${duration.minutes < 10 ? '0' : ''}${duration.minutes}`;
    const seconds = `${duration.seconds < 10 ? '0' : ''}${duration.seconds}`;
    return `${hours}:${minutes}:${seconds}`;
};

export function getDuration<T = unknown>(item: ITimer<T>): number {
    const remaining = item.active ? Date.now() - item.lastStartTimestamp : 0;
    return item.duration + remaining;
}

const advanceDuration = (
    timer: ITimer<unknown>
): { hours: number; minutes: number; seconds: number } => {
    let rest = getDuration(timer);
    const result = {
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    result.hours = Math.floor(rest / HOUR);
    rest -= result.hours * HOUR;
    result.minutes = Math.floor(rest / MINUTE);
    rest -= result.minutes * MINUTE;
    result.seconds = Math.floor(rest / SECOND);
    return result;
};

export function TimerItem<T>(props: ITimerItemProps<T>): JSX.Element {
    const [timerDuration, setTimerDuration] = React.useState<ITimerDuration>({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [pickerValue, setPickerValue] = React.useState<string>('');
    const timerRef = React.useRef<number>(0);
    const getTaskText = props.getTaskText || ((task: T) => task?.toString());
    const visibility = useVisibility();

    const createTagFromTask = (
        item: T
    ): { key: string | number; name: string } => {
        return {
            key: props.getTaskId(item),
            name: props.getTaskText(item),
        };
    };

    /**
     * If timer is active, we will count seconds from start timestamp
     */
    React.useEffect(() => {
        if (props.item.active && visibility.visible) {
            const passed = calculatePassedTime(getDuration(props.item));
            setTimerDuration(passed);
            timerRef.current = setInterval(() => {
                setTimerDuration(advanceDuration(props.item));
            }, 1000);
        } else {
            setTimerDuration(calculatePassedTime(props.item.duration));
        }
        return () => clearInterval(timerRef.current);
    }, [props.item.active, visibility]);

    return (
        <div className={styles.container}>
            <IconButton
                iconProps={{
                    iconName: props.item.active ? 'pause' : 'play',
                }}
                onClick={() => props.onToggle(props.item.id, props.item.active)}
            />
            <Text className={styles.timerDuration} variant="smallPlus">
                {formatPassedDuration(timerDuration)}
            </Text>
            {props.item.description ? (
                <TextField
                    multiline={props.item.description.length > 35}
                    resizable={false}
                    autoAdjustHeight
                    className={styles.timerInput}
                    placeholder="Spot task description..."
                    value={props.item.description}
                    onChange={(_ev, value) =>
                        props.onUpdated({
                            ...props.item,
                            spot: value.length > 0,
                            description: value,
                        })
                    }
                />
            ) : (
                <TagPicker
                    className={styles.timerInput}
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
                    onBlur={() => {
                        if (pickerValue) {
                            props.onUpdated({
                                ...props.item,
                                spot: true,
                                description: pickerValue,
                            });
                        }
                    }}
                    onInputChange={(val: string) => {
                        setPickerValue(val);
                        return val;
                    }}
                    onChange={(items) => {
                        let task = null;
                        if (items.length > 0) {
                            task = props.tasks.find(
                                (t) => props.getTaskId(t) === items[0].key
                            );
                        }
                        setPickerValue('');
                        props.onTaskSelect(
                            {
                                ...props.item,
                                spot: !Boolean(task),
                                description: '',
                            },
                            task
                        );
                    }}
                    itemLimit={1}
                />
            )}
            <Checkbox
                inputProps={{
                    tabIndex: -1,
                }}
                label="Spot"
                checked={props.item.spot}
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
