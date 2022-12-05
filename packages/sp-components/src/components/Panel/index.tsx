import * as React from 'react';
import styles from './Panel.module.scss';

const EVENT_PREFIX = 'sp-panel-visibility';
const getEventName = (id: string) => `${EVENT_PREFIX}/${id}`;

import { IPanelProps, Panel as FabrikPanel } from 'office-ui-fabric-react';

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

export const Panel: React.FC<ICustomPanelProps> = (props) => {
    const event = React.useMemo(() => getEventName(props.id), []);
    const [panelProps, setPanelProps] = React.useState<IPanelProps>(null);
    const [content, setContent] = React.useState(null);

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

    const handleDismiss = React.useCallback(() => {
        console.log(props.id);
        hidePanel(props.id);
    }, []);

    console.log(panelProps?.isOpen);

    return (
        <FabrikPanel {...props.defaultProps} {...panelProps} onDismiss={handleDismiss}>
            {content}
        </FabrikPanel>
    );
};
