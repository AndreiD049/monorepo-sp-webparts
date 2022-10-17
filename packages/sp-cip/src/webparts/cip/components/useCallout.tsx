import { Callout, DirectionalHint } from "office-ui-fabric-react";
import * as React from "react";
import { calloutVisibilityHandler, ICalloutEventProps } from "../utils/dom-events";


export const useCallout = (): { CalloutComponent: JSX.Element } => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultProps: ICalloutEventProps<any> = React.useMemo(() => ({
        target: null,
        visible: false,
        directionalHint: DirectionalHint.bottomCenter,
        RenderComponent: () => null,
    }), []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [calloutData, setCalloutData] = React.useState<ICalloutEventProps<any>>({
        ...defaultProps,
        onDismiss: () => setCalloutData((prev) => ({
            ...prev,
            visible: false,
        })),
    });
    const RenderComponent = React.useMemo(() => calloutData.RenderComponent, [calloutData.RenderComponent, calloutData.componentProps]);

    /** Attach the events */
    React.useEffect(() => {
        const removeHandler = calloutVisibilityHandler((props) => {
            setCalloutData(prev => ({
                ...prev,
                ...props,
            }));
        });
        return () => removeHandler();
    }, []);

    const CalloutComponent = React.useMemo(() => {
        if (!calloutData.visible) return null;
        return (
            <Callout
                {...calloutData}
            >
                <RenderComponent {...calloutData.componentProps} />
            </Callout>
        );
    }, [calloutData]);

    return { CalloutComponent };
}
