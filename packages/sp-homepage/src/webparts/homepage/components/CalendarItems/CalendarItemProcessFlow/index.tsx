import { textColor } from 'colored-text';
import { IconButton, Persona, PersonaSize } from 'office-ui-fabric-react';
import * as React from 'react';
import { Pill } from 'sp-components';
import { ICalendarProcessFlowItem, IWrappedCalendarItem } from '../../../sections/CalendarSection/ICalendarItem';
import styles from './CalendarItemProcessFlow.module.scss';

export interface ICalendarItemProcessFlowProps {
    wrapped: IWrappedCalendarItem;
}

export const CalendarItemProcessFlow: React.FC<ICalendarItemProcessFlowProps> = (props) => {
    const item = props.wrapped.item as ICalendarProcessFlowItem;
    const type = "PF";
    const typeColor = React.useMemo(() => textColor(type), [item]);
    const statusColor = React.useMemo(() => textColor(item.Status), [item]);
    return (
        <div className={styles.container}>
            <Persona 
                size={PersonaSize.size32}
                text={item.User.Title}
                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${item.User.EMail}&Size=L`}
            />
            <Pill title="Process-flow" value={type} style={{ color: typeColor.fg, backgroundColor: typeColor.bg, minWidth: 60 }} />
            <Pill style={{ color: statusColor.fg, backgroundColor: statusColor.bg }} value={item.Status} />
            <div>{item.Process.Title}</div>
            <IconButton iconProps={{ iconName: 'OpenInNewTab'}} onClick={() => window.open(`${props.wrapped.pageUrl}#/process/${item.Process.Id}?flow=${item.Flow.Id}&team=${item.Team}`)} />
        </div>
    );
};
