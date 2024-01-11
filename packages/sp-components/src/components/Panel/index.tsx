import * as React from 'react';
import styles from './Panel.module.scss';

const EVENT_PREFIX = 'sp-panel-visibility';
const CLICK_EVENT_PREFIX = 'sp-panel-button';
const getEventName = (id: string) => `${EVENT_PREFIX}/${id}`;

import { IPanelProps, Panel as FabricPanel } from '@fluentui/react';

export interface ICustomPanelProps {
    id: string;
    defaultProps?: IPanelProps;
}

interface IPanelEventProps {
    props: IPanelProps;
    content?: JSX.Element;
}

export function showPanel(id: string, detail: IPanelProps, content: JSX.Element) {
    document.dispatchEvent(
        new CustomEvent<IPanelEventProps>(getEventName(id), {
            detail: {
                props: {
                    ...detail,
                    isOpen: true,
                },
                content,
            },
        })
    );
}

export function hidePanel(id: string) {
    document.dispatchEvent(
        new CustomEvent<IPanelEventProps>(getEventName(id), {
            detail: {
                props: {
                    isOpen: false,
                },
            },
        })
    );
}

export function handleButtonClick(id: string, buttonText: string, func: () => void) {
    const handler = (evt: CustomEvent) => {
        func();
    };
    const eventName = `${CLICK_EVENT_PREFIX}/${buttonText}/${id}`;
    document.addEventListener(eventName, handler);
    return () => document.removeEventListener(eventName, handler);
}

export function dispatchButtonClick(id: string, buttonText: string) {
    const eventName = `${CLICK_EVENT_PREFIX}/${buttonText}/${id}`;
    document.dispatchEvent(new CustomEvent(eventName));
}

export const Panel: React.FC<ICustomPanelProps> = (props) => {
    const event = React.useMemo(() => getEventName(props.id), []);
    const [panelProps, setPanelProps] = React.useState<IPanelProps>(null);
    const [content, setContent] = React.useState(null);

    const className = React.useMemo(() => {
        if (panelProps?.isOpen) {
            return styles.fade;
        }
        return styles.invisible;
    }, [panelProps?.isOpen]);

    React.useEffect(() => {
        function handler(ev: CustomEvent<IPanelEventProps>) {
            setPanelProps(ev.detail.props);
            if (ev.detail.props?.isOpen) {
                setContent(ev.detail.content);
            }
        }
        document.addEventListener(event, handler);
        return () => document.removeEventListener(event, handler);
    }, []);

    const handleDismiss = React.useCallback((ev) => {
        panelProps.onDismiss ? panelProps.onDismiss(ev) : hidePanel(props.id);
    }, [panelProps]);

    return (
        <FabricPanel {...props.defaultProps} {...panelProps} onDismiss={handleDismiss}>
            <div className={className}>
                {content}
            </div>
        </FabricPanel>
    );
};
