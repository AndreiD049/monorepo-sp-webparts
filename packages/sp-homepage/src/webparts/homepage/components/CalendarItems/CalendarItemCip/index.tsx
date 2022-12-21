import * as React from 'react';
import { ICalendarCipItem, IWrappedCalendarItem } from '../../../sections/CalendarSection/ICalendarItem';
import { textColor } from 'colored-text';
import { Pill } from 'sp-components';
import { IconButton, Persona, PersonaSize } from 'office-ui-fabric-react';
import styles from './CalendarItemCip.module.scss';

export interface ICalendarItemCipProps {
    wrapped: IWrappedCalendarItem;
}

export const CalendarItemCip: React.FC<ICalendarItemCipProps> = (props) => {
    const item = props.wrapped.item as ICalendarCipItem;
    const type = "CIP";
    const typeColor = React.useMemo(() => textColor(type), [item]);
    const statusColor = React.useMemo(() => textColor(item.Status), [item]);
    return (
        <div className={styles.container}>
            <Persona 
                size={PersonaSize.size32}
                text={item.Responsible.Title}
                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${item.Responsible.EMail}&Size=L`}
            />
            <Pill title='Cip' value={type} style={{ color: typeColor.fg, backgroundColor: typeColor.bg, minWidth: 60 }} />
            <Pill style={{ color: statusColor.fg, backgroundColor: statusColor.bg }} value={item.Status} />
            <div>{item.Title}</div>
            <IconButton iconProps={{ iconName: 'OpenInNewTab'}} onClick={() => window.open(`${props.wrapped.pageUrl}#/task/${item.Id}`, '_blank', 'noreferrer')} />
        </div>
    );
};
