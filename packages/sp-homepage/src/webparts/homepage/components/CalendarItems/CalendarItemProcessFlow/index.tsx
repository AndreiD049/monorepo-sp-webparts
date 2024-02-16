import { textColor } from 'colored-text';
import { IconButton, Persona, PersonaSize, Text } from '@fluentui/react';
import * as React from 'react';
import { Pill } from 'sp-components';
import { CalendarContext } from '../../../context/CalendarContext/CalendarContext';
import {
    ICalendarProcessFlowItem,
    IWrappedCalendarItem,
} from '../../../sections/CalendarSection/ICalendarItem';
import tableStyles from '../CalendarItems.module.scss';
import { getStatusStyles } from '../statusStyles';

export interface ICalendarItemProcessFlowProps {
    wrapped: IWrappedCalendarItem;
}

export const CalendarItemProcessFlow: React.FC<ICalendarItemProcessFlowProps> = (props) => {
    const { showUser, showStatus } = React.useContext(CalendarContext);
    const item = props.wrapped.item as ICalendarProcessFlowItem;
    const type = 'PF';
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
        window.open(
            `${props.wrapped.pageUrl}#/team/${item.Team}/flow/${item.Flow.Id}/process/${item.Process.Id}`,
            '_blank',
            'noreferrer'
        );
    }, []);

    const userCell = React.useMemo(() => {
        if (showUser) {
            return (
                <td className={`${tableStyles.cell20} ${tableStyles.paddedl5}`}>
                    <Persona
                        size={PersonaSize.size32}
                        text={item.User.Title}
                        imageUrl={`/_layouts/15/userphoto.aspx?accountname=${item.User.EMail}&Size=L`}
                    />
                </td>
            );
        }
        return null;
    }, [showUser, item.User]);

    const statusCell = React.useMemo(() => {
        if (showStatus) {
            return (
                <td className={`${tableStyles.cell10} ${tableStyles.paddedl5}`}>
                    <Pill style={statusStyles} title={item.Status} value={item.Status} />
                </td>
            );
        }
        return null;
    }, [showStatus, item.Status]);

    return (
        <tr
            className={`${tableStyles.row} ${tableStyles.mousePointer}`}
            onDoubleClick={handleGotoClick}
        >
            {userCell}
            <td className={`${tableStyles.cell10} ${tableStyles.paddedl5}`}>
                <Pill
                    title="Process-flow"
                    value={type}
                    style={{ color: typeColor.fg, backgroundColor: typeColor.bg, minWidth: 60 }}
                />
            </td>
            {statusCell}
            <td className={`${tableStyles.paddedCell} ${tableStyles.paddedl5}`}>
                <Text variant="medium">{item.Process.Title}</Text>
            </td>
            <td className={tableStyles.cell5}>
                <IconButton iconProps={{ iconName: 'OpenInNewTab' }} onClick={handleGotoClick} />
            </td>
        </tr>
    );
};
