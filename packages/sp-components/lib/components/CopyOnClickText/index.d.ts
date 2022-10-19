import { ITextProps } from 'office-ui-fabric-react';
import * as React from 'react';
export interface ICopyOnClickTextProps extends ITextProps {
    text: string;
}
export declare const CopyOnClickText: React.FC<ICopyOnClickTextProps>;
