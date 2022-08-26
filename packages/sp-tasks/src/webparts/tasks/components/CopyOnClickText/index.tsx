import { Icon, ITextProps, MessageBarType, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import styles from './CopyOnClickText.module.scss';

export interface ICopyOnClickTextProps extends ITextProps {
    text: string;
}

// returns an object with a display value (that shoule be shown)
// And copy value, that should be copied
// In order to cover scenarios like [[Long text|display]]
const parseValue = (text: string) => {
    const result = {
        display: text,
        copy: text,
    };
    const pipeIdx = text.indexOf('|');
    if (pipeIdx > -1) {
        const isSinglePipe = text.lastIndexOf('|') === pipeIdx;
        if (isSinglePipe) {
            result.display = text.slice(pipeIdx + 1);
            result.copy = text.slice(0, pipeIdx);
        }
    }
    return result;
}

export const CopyOnClickText: React.FC<ICopyOnClickTextProps> = (
    props
) => {
    const values = React.useMemo(() => parseValue(props.text), [props.text]);
    const handleClick = React.useCallback(() => {
        const text = props.children as string;
        navigator.clipboard.writeText(values.copy);
        SPnotify({
            message: `Text '${values.copy}' copied to clipboard`,
            messageType: MessageBarType.success,
        });
    }, [values]);

    return (
        <span className={styles.container} onClick={handleClick}>
            <Text {...props}>
                {values.display}
            </Text>
            <Icon className={styles.icon} iconName="ClipboardList" />
        </span>
    );
};
