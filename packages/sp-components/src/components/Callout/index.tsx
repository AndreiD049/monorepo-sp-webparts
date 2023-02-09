import * as React from 'react';
import { Callout as FluentCallout, DirectionalHint, ICalloutProps } from 'office-ui-fabric-react';

const EVENT_PREFIX = 'sp-callout-visibility';

export interface ICalloutEventProps {
    calloutProps: ICalloutProps;
    content: JSX.Element;
    visible: boolean;
    id: string;
}

export const showCallout = (props: Omit<ICalloutEventProps, 'visible'>) => {
    document.dispatchEvent(
        new CustomEvent<ICalloutEventProps>(`${EVENT_PREFIX}/${props.id}`, {
            detail: {
                ...props,
                visible: true,
            },
        })
    );
};

export const updateCalloutContent = (id: string, content: JSX.Element) => {
    document.dispatchEvent(
        new CustomEvent<{ id: string; content: JSX.Element }>(
            `${EVENT_PREFIX}/${id}/content`,
            {
                detail: {
                    id,
                    content,
                },
            }
        )
    );
};

export const hideCallout = (id: string) => {
    document.dispatchEvent(
        new CustomEvent<ICalloutEventProps>(`${EVENT_PREFIX}/${id}`, {
            detail: {
                calloutProps: {
                    target: null,
                },
                content: null,
                visible: false,
                id,
            },
        })
    );
};

export interface ISPCalloutProps {
    id: string;
}

export const Callout: React.FC<ISPCalloutProps> = (props) => {
    const eventName = `${EVENT_PREFIX}/${props.id}`;
    const [calloutProps, setCalloutProps] = React.useState<ICalloutProps>({
        target: null,
        directionalHint: DirectionalHint.bottomCenter,
    });
    const [renderComponent, setRenderComponent] = React.useState<JSX.Element >(null);
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        function visibilityHandler(evt: CustomEvent<ICalloutEventProps>) {
            if (evt.detail.id === props.id) {
                setCalloutProps(evt.detail.calloutProps);
                setRenderComponent(evt.detail.content);
                setVisible(evt.detail.visible);
            }
        }
        function contentChangeHandler(
            evt: CustomEvent<{ id: string; content: JSX.Element }>
        ) {
            if (evt.detail.id === props.id) {
                setRenderComponent(evt.detail.content);
            }
        }
        document.addEventListener(eventName, visibilityHandler);
        document.addEventListener(`${eventName}/content`, contentChangeHandler);
        return () => {
            document.removeEventListener(eventName, visibilityHandler);
            document.removeEventListener(`${eventName}/content`, contentChangeHandler);
        };
    }, []);

    if (!visible) return null;

    return (
        <FluentCallout {...calloutProps} onDismiss={() => hideCallout(props.id)}>
            {renderComponent}
        </FluentCallout>
    );
};
