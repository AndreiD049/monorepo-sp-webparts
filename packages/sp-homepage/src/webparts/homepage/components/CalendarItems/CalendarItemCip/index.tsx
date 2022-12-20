import * as React from 'react';
import { ICalendarCipItem } from '../../../sections/CalendarSection/ICalendarItem';
import { textColor } from 'colored-text';
import { Pill } from 'sp-components';
import { IconButton, Persona, PersonaSize } from 'office-ui-fabric-react';
import styles from './CalendarItemCip.module.scss';

export interface ICalendarItemCipProps {
    item: ICalendarCipItem;
}

export const CalendarItemCip: React.FC<ICalendarItemCipProps> = (props) => {
    const type = "CIP";
    const typeColor = React.useMemo(() => textColor(type), [props.item]);
    const statusColor = React.useMemo(() => textColor(props.item.Status), [props.item]);
    return (
        <div className={styles.container}>
            <Persona 
                size={PersonaSize.size32}
                text={props.item.Responsible.Title}
                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${props.item.Responsible.EMail}&Size=L`}
            />
            <Pill title='Cip' value={type} style={{ color: typeColor.fg, backgroundColor: typeColor.bg, minWidth: 60 }} />
            <Pill style={{ color: statusColor.fg, backgroundColor: statusColor.bg }} value={props.item.Status} />
            <div>{props.item.Title}</div>
            <IconButton iconProps={{ iconName: 'OpenInNewTab'}} />
        </div>
    );
};
