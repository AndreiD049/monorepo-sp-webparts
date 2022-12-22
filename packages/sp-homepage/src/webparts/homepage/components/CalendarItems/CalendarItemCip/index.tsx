import * as React from 'react';
import {
    ICalendarCipItem,
    IWrappedCalendarItem,
} from '../../../sections/CalendarSection/ICalendarItem';
import { textColor } from 'colored-text';
import { Pill } from 'sp-components';
import { IconButton, Persona, PersonaSize, Text } from 'office-ui-fabric-react';
import styles from './CalendarItemCip.module.scss';
import tableStyles from '../CalendarItems.module.scss';
import { getStatusStyles } from '../statusStyles';

export interface ICalendarItemCipProps {
    wrapped: IWrappedCalendarItem;
}

export const CalendarItemCip: React.FC<ICalendarItemCipProps> = (props) => {
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

    return (
        <tr className={styles.container}>
            <td className={tableStyles.cell20}>
                <Persona
                    size={PersonaSize.size32}
                    text={item.Responsible.Title}
                    imageUrl={`/_layouts/15/userphoto.aspx?accountname=${item.Responsible.EMail}&Size=L`}
                />
            </td>
            <td className={tableStyles.cell10}>
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
            <td className={tableStyles.cell10}>
                <Pill style={statusStyles} title={item.Status} value={item.Status} />
            </td>
            <td className={tableStyles.paddedCell}>
                <Text variant="medium">{item.Title}</Text>
            </td>
            <td className={tableStyles.cell5}>
                <IconButton
                    iconProps={{ iconName: 'OpenInNewTab' }}
                    onClick={() =>
                        window.open(
                            `${props.wrapped.pageUrl}#/task/${item.Id}`,
                            '_blank',
                            'noreferrer'
                        )
                    }
                />
            </td>
        </tr>
    );
};
