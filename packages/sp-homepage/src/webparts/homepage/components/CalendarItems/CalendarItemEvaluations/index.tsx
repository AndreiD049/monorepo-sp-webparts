import { IconButton, Persona, PersonaSize, Text } from '@fluentui/react';
import { textColor } from 'colored-text';
import * as React from 'react';
import { CalendarContext } from '../../../context/CalendarContext/CalendarContext';
import { ICalendarEvaluationItem, IWrappedCalendarItem } from '../../../sections/CalendarSection/ICalendarItem';
import { getStatusStyles } from '../statusStyles';
import tableStyles from '../CalendarItems.module.scss';
import { Pill } from 'sp-components';

export interface ICalendarItemEvaluationsProps {
    // Props go here
    wrapped: IWrappedCalendarItem;
}

export const CalendarItemEvaluations: React.FC<ICalendarItemEvaluationsProps> = (props) => {
    const { showUser, showStatus } = React.useContext(CalendarContext);
    const item = props.wrapped.item as ICalendarEvaluationItem;
    const type = 'EVALUATION';
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

    const userCell = React.useMemo(() => {
        if (showUser) {
            return (
                <td className={`${tableStyles.cell20} ${tableStyles.paddedl5}`}>
                    <Persona
                        size={PersonaSize.size32}
                        text={item.Employee.Title}
                        imageUrl={`/_layouts/15/userphoto.aspx?accountname=${item.Employee.EMail}&Size=L`}
                    />
                </td>
            );
        }
        return null;
    }, [showUser, item.Employee]);

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

    const handleGotoClick = React.useCallback(() => {
        window.open(
            `${props.wrapped.pageUrl}?ID=${item.Id}`,
            '_blank',
            'noreferrer'
        );
    }, []);

	const additionalInfo = React.useMemo(() => {
		if (showUser) {
			return `${item.Status} - ${item.CurrentLevel}`
		}
		return item.CurrentLevel
	}, [showUser, item]);

    return (
        <tr
            className={`${tableStyles.row} ${tableStyles.mousePointer}`}
            onDoubleClick={handleGotoClick}
        >
            {userCell}
            <td className={`${tableStyles.cell10} ${tableStyles.paddedl5}`}>
                <Pill
                    title="Rotation"
                    value={type}
                    style={{ color: typeColor.fg, backgroundColor: typeColor.bg, minWidth: 60 }}
                />
            </td>
            {statusCell}
            <td title={additionalInfo} className={`${tableStyles.paddedCell} ${tableStyles.cellMin200} ${tableStyles.paddedl5}`}>
                <Text variant="medium">{additionalInfo}</Text>
            </td>
            <td className={tableStyles.cell5}>
                <IconButton iconProps={{ iconName: 'OpenInNewTab' }} onClick={handleGotoClick} />
            </td>
        </tr>
    );

};
