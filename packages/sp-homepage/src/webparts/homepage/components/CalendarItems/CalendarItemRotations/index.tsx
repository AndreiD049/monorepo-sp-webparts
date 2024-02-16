import { textColor } from 'colored-text';
import { IconButton, Persona, PersonaSize, Text } from '@fluentui/react';
import * as React from 'react';
import { CalendarContext } from '../../../context/CalendarContext/CalendarContext';
import { ICalendarRotationsItem, IWrappedCalendarItem } from '../../../sections/CalendarSection/ICalendarItem';
import { getStatusStyles } from '../statusStyles';
import tableStyles from '../CalendarItems.module.scss';
import { Pill } from 'sp-components';
import { GlobalContext } from '../../../context/GlobalContext';

export interface ICalendarItemRotationsProps {
    wrapped: IWrappedCalendarItem;
}

export const CalendarItemRotations: React.FC<ICalendarItemRotationsProps> = (props) => {
	const { selectedUser } = React.useContext(GlobalContext);
    const { showUser, showStatus } = React.useContext(CalendarContext);
    const item = props.wrapped.item as ICalendarRotationsItem;
    const type = 'ROTATION';
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
                        text={item.Personinvolved.Title}
                        imageUrl={`/_layouts/15/userphoto.aspx?accountname=${item.Personinvolved.EMail}&Size=L`}
                    />
                </td>
            );
        }
        return null;
    }, [showUser, item.Personinvolved]);

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
		if (!showUser && item.Personinvolved.Id !== selectedUser.Id) {
			return `(involved: ${item.Personinvolved.Title}; go to: ${item.Persontogo?.Title || 'N/A'})`;
		}
		return `(go to: ${item.Persontogo?.Title || 'N/A'})`;
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
            <td className={`${tableStyles.paddedCell} ${tableStyles.paddedl5}`}>
                <Text variant="medium">{item.Activityrecommended} {additionalInfo}</Text>
            </td>
            <td className={tableStyles.cell5}>
                <IconButton iconProps={{ iconName: 'OpenInNewTab' }} onClick={handleGotoClick} />
            </td>
        </tr>
    );
};
