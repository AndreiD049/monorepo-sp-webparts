import { textColor } from 'colored-text';
import { IconButton, Persona, PersonaSize } from 'office-ui-fabric-react';
import * as React from 'react';
import { Pill } from 'sp-components';
import { ICalendarProcessFlowItem } from '../../../sections/CalendarSection/ICalendarItem';
import styles from './CalendarItemProcessFlow.module.scss';

export interface ICalendarItemProcessFlowProps {
    item: ICalendarProcessFlowItem;
}

export const CalendarItemProcessFlow: React.FC<ICalendarItemProcessFlowProps> = (props) => {
    const type = "PROC";
    const typeColor = React.useMemo(() => textColor(type), [props.item]);
    const statusColor = React.useMemo(() => textColor(props.item.Status), [props.item]);
    return (
        <div className={styles.container}>
            <Persona 
                size={PersonaSize.size32}
                text={props.item.User.Title}
                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${props.item.User.EMail}&Size=L`}
            />
            <Pill title="Process-flow" value={type} style={{ color: typeColor.fg, backgroundColor: typeColor.bg, minWidth: 60 }} />
            <Pill style={{ color: statusColor.fg, backgroundColor: statusColor.bg }} value={props.item.Status} />
            <div>{props.item.Process.Title}</div>
            <IconButton iconProps={{ iconName: 'OpenInNewTab'}} />
        </div>
    );
};
