import * as React from 'react';
import { ICalloutProps } from 'office-ui-fabric-react';
export interface ICalloutEventProps {
    calloutProps: ICalloutProps;
    content: JSX.Element;
    visible: boolean;
    id: string;
}
export declare const showCallout: (props: Omit<ICalloutEventProps, 'visible'>) => void;
export declare const hideCallout: (id: string) => void;
export interface ISPCalloutProps {
    id: string;
}
export declare const Callout: React.FC<ISPCalloutProps>;
