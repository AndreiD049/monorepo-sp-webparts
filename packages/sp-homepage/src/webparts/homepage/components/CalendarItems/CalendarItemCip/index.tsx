import * as React from 'react';
import {
    ICalendarCipItem,
    IWrappedCalendarItem,
} from '../../../sections/CalendarSection/ICalendarItem';
import { textColor } from 'colored-text';
import { Pill } from 'sp-components';
import { IconButton, Persona, PersonaSize, Text } from 'office-ui-fabric-react';
import tableStyles from '../CalendarItems.module.scss';
import { getStatusStyles } from '../statusStyles';
import { CalendarContext } from '../../../context/CalendarContext/CalendarContext';

export interface ICalendarItemCipProps {
    wrapped: IWrappedCalendarItem;
}

export const CalendarItemCip: React.FC<ICalendarItemCipProps> = (props) => {
    const { showUser } = React.useContext(CalendarContext);
    const item = props.wrapped.item as ICalendarCipItem;
    const type = 'CIP';
    const typeColor = React.useMemo(() => textColor(type), [item]);

    const statusStyles: React.CSSProperties = React.useMemo(() => {
        return {
            ...getStatusStyles(item.Status),
            display: 'block',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'pre',
            width: '80px',
            justifyContent: 'flex-start',
        };
    }, [item.Status]);

    const handleGotoClick = React.useCallback(() => {
        window.open(`${props.wrapped.pageUrl}#/task/${item.Id}`, '_blank', 'noreferrer');
    }, []);

    const userCell = React.useMemo(() => {
        if (showUser) {
            return (
                <td className={`${tableStyles.cell20} ${tableStyles.paddedl5}`}>
                    <Persona
                        size={PersonaSize.size32}
                        text={item.Responsible.Title}
                        imageUrl={`/_layouts/15/userphoto.aspx?accountname=${item.Responsible.EMail}&Size=L`}
                    />
                </td>
            );
        }
        return null;
    }, [showUser, item.Responsible]);

    return (
        <>
            {userCell}
            <td className={`${tableStyles.cell10} ${tableStyles.paddedl5}`}>
                <Pill
                    title="Cip"
                    value={type}
                    style={{
                        color: typeColor.fg,
                        backgroundColor: typeColor.bg,
                        minWidth: 60,
                    }}
                />
            </td>
            <td className={`${tableStyles.cell10} ${tableStyles.paddedl5}`}>
                <Pill style={statusStyles} title={item.Status} value={item.Status} />
            </td>
            <td className={tableStyles.paddedl5}>
                <Text variant="medium">{item.Title}</Text>
            </td>
            <td className={tableStyles.cell5}>
                <IconButton iconProps={{ iconName: 'OpenInNewTab' }} onClick={handleGotoClick} />
            </td>
        </>
    );
};
