import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react';
import * as React from 'react';

export type ChoiceDisplayType = 'week' | 'month';

export interface ICalendarChoiceGroupProps {
    selectedChoice: ChoiceDisplayType;
    onChoiceChange: (choice: ChoiceDisplayType) => void;
}

export const CalendarChoiceGroup: React.FC<ICalendarChoiceGroupProps> = (props) => {
    const options: IChoiceGroupOption[] = [
        { key: 'week', text: 'Week', iconProps: { iconName: 'CalendarWeek' } },
        { key: 'month', text: 'Month', iconProps: { iconName: 'Calendar' } },
    ];

    const handleChoice: (
        ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
        option?: IChoiceGroupOption
    ) => void = React.useCallback((ev, choice) => {
        props.onChoiceChange(choice.key as ChoiceDisplayType);
    }, []);

    return (
        <ChoiceGroup
            styles={{
                flexContainer: { flexFlow: 'column', height: '100%' },
                root: { height: '100%' },
            }}
            options={options}
            selectedKey={props.selectedChoice}
            onChange={handleChoice}
        />
    );
};
