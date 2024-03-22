import { DateTime } from 'luxon';
import { ActionButton, ComboBox, IComboBoxOption } from '@fluentui/react';
import * as React from 'react';
import styles from './TimePicker.module.scss';

interface ITimePickerProps {
    value: string;
    daysValue: number;
    onTimeChange: (time: string) => void;
    onDaysDelayChange: (days: number) => void;
}

const hours = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
];
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const hourOptions: IComboBoxOption[] = hours.map((h) => ({
    key: Number.parseInt(h),
    text: h,
}));

const minuteOptions: IComboBoxOption[] = minutes.map((m) => ({
    key: Number.parseInt(m),
    text: m,
}));

const isTimeValid = (time: string): boolean => {
    const dt = DateTime.fromISO(time);
    return dt.isValid;
};

const isDaysOffsetValid = (days: number) => {
    return !Number.isNaN(days) && days >= 0;
};

export const TimePicker: React.FC<ITimePickerProps> = (props) => {
    const timeObject = React.useMemo(() => {
        if (isTimeValid(props.value)) {
            return DateTime.fromISO(props.value);
        }
        return DateTime.now().set({ hour: 9, minute: 0, second: 0 });
    }, [props.value]);

    const handleDaysChange = (offset: number) => () => {
        const newValue = props.daysValue + offset;
        if (isDaysOffsetValid(newValue)) {
            props.onDaysDelayChange(newValue);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.timePicker}>
                <div className={styles.timePickerTimeContainer}>
                    <ComboBox
                        styles={{
                            root: {
                                width: '75px',
                            },
                        }}
                        options={hourOptions}
                        dropdownWidth={20}
                        autoComplete="on"
                        selectedKey={timeObject.hour}
                        onChange={(ev, opt) => {
                            props.onTimeChange(timeObject.set({ hour: +opt.key }).toISO());
                        }}
                        calloutProps={{
                            calloutMaxHeight: 500,
                            calloutMinWidth: 75,
                        }}
                    />
                    <div className={styles.timePickerTimeDelimiter}>:</div>
                    <ComboBox
                        styles={{
                            root: {
                                width: '75px',
                            },
                        }}
                        options={minuteOptions}
                        dropdownWidth={20}
                        autoComplete="on"
                        selectedKey={timeObject.minute}
                        onChange={(ev, opt) => {
                            props.onTimeChange(timeObject.set({ minute: +opt.key }).toISO());
                        }}
                        calloutProps={{
                            calloutMaxHeight: 500,
                            calloutMinWidth: 75,
                        }}
                    />
                </div>
                <div className={styles.timePickerDayContainer}>
                    <ActionButton tabIndex={-1} onClick={handleDaysChange(-1)} styles={{ root: { height: 30 } }}>
                        -1day
                    </ActionButton>
                    <ActionButton tabIndex={-1} onClick={handleDaysChange(1)} styles={{ root: { height: 30 } }}>
                        +1day
                    </ActionButton>
                </div>
            </div>
            {props.daysValue > 0 && <div className={styles.daysLabel}>+{props.daysValue}d</div>}
        </div>
    );
};
