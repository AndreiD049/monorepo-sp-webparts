import { IPanelProps, Panel, PanelType } from 'office-ui-fabric-react';
import * as React from 'react';

export const EVENT_NAME = (id: string) => `USE_PANEL_EVENT_${id}`;

export interface IUsePanelProps extends IPanelProps {
    PanelContents?: React.ReactElement;
}

export const createPanel = (id: string, props: IUsePanelProps) => {
    document.dispatchEvent(
        new CustomEvent(EVENT_NAME(id), {
            detail: props,
        })
    );
};

export const closePanel = (id: string) => {
    document.dispatchEvent(
        new CustomEvent(EVENT_NAME(id), {
            detail: {
                isOpen: false,
            },
        })
    );
};

export const setPanelProperties = (id: string, props: IUsePanelProps) => {
    document.dispatchEvent(
        new CustomEvent(EVENT_NAME(id), {
            detail: props,
        })
    );
};

export const usePanel = (id: string, panelProps?: IPanelProps) => {
    const [state, setState] = React.useState<IUsePanelProps>({
        isOpen: false,
        headerText: 'Panel',
        PanelContents: null,
        ...panelProps,
    });

    const handleDismiss = () =>
        setState({
            isOpen: false,
            headerText: 'Panel',
            PanelContents: null,
            ...panelProps,
        });

    React.useEffect(() => {
        function handler(evt: CustomEvent<IUsePanelProps>) {
            if (evt.detail) {
                setState((prev) => ({
                    ...prev,
                    ...evt.detail,
                }));
            }
        }
        document.addEventListener(EVENT_NAME(id), handler);
        return () => document.removeEventListener(EVENT_NAME(id), handler);
    }, []);

    return (
        <Panel
            {...state}
            onDismiss={handleDismiss}
            allowTouchBodyScroll
        >
            {state.PanelContents}
        </Panel>
    );
};
