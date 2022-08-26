import { Icon, ITextProps, MessageBarType, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import styles from './CopyOnClickText.module.scss';

export interface ICopyOnClickTextProps extends ITextProps {}

export const CopyOnClickText: React.FC<React.PropsWithChildren<ICopyOnClickTextProps>> = (
    props
) => {
    const handleClick = () => {
        const text = props.children as string;
        navigator.clipboard.writeText(text);
        SPnotify({
            message: `Text '${text}' copied to clipboard`,
            messageType: MessageBarType.success,
        });
    };

    return (
        <span className={styles.container} onClick={handleClick}>
            <Text {...props}>
                {props.children}
            </Text>
            <Icon className={styles.icon} iconName="ClipboardList" />
        </span>
    );
};
