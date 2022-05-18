import {
    Panel,
    PanelType,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { openPanelHandler } from '../utils/dom-events';

export interface IPanelState {
    isOpen: boolean;
    headerText?: string;
    onRenderComponent: () => React.ReactElement;
    onRenderFooterContent: () => React.ReactElement;
    type?: PanelType;
    onDismiss: () => void;
    callbacks: React.MutableRefObject<{ [key: string]: () => void }>;
}

export interface IPanelContext extends IPanelState {
    setContext: React.Dispatch<React.SetStateAction<IPanelContext>>;
    onDismiss: () => void;
    callbacks: React.MutableRefObject<{ [key: string]: () => void }>;
}

export interface IPanelComponentProps {
    setFooter: React.Dispatch<any>;
}

export interface IPanelProps {
    id: string;
    isLightDismiss?: boolean;
    isFooterAtBottom?: boolean;
    headerText?: string;
    RenderComponent: React.FunctionComponent<any>;
    ComponentProps?: any;
    type?: PanelType;
}

const usePanel = (props?: IPanelProps) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [footer, setFooter] = React.useState(null);
    const { RenderComponent } = props;
    const [componentProps, setComponentProps] = React.useState<any>({});

    React.useEffect(() => {
        const removeOpenHandler = openPanelHandler(props.id, (open, props) => {
            if (props) {
                setComponentProps(props);
            }
            if (open) {
                setIsOpen(open);
            } else {
                handleDismiss();
            }
        });
        return () => removeOpenHandler();
    }, []);

    const handleDismiss = React.useCallback(() => {
        setIsOpen(false);
        setComponentProps({});
    }, []);

    const PanelComponent = React.useMemo(() => {
        if (!isOpen) return null;

        return (
            <Panel
                isOpen={isOpen}
                onDismiss={handleDismiss}
                isLightDismiss={props?.isLightDismiss || false}
                headerText={componentProps?.headerText || props?.headerText || ''}
                onRenderFooterContent={() => footer}
                isFooterAtBottom={props?.isFooterAtBottom || false}
                type={props?.type || PanelType.smallFixedFar}
            >
                <RenderComponent
                    setFooter={setFooter}
                    {...props.ComponentProps}
                    {...componentProps}
                />
            </Panel>
        );
    }, [props]);

    return {
        PanelComponent,
        setIsOpen,
    };
};

export default usePanel;
