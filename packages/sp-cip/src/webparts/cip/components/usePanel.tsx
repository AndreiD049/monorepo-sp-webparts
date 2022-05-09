import {
    ColumnDragEndLocation,
    Panel,
    PanelType,
    setPortalAttribute,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { PANEL_OPEN_EVT } from '../utils/constants';

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
    setOpen: React.Dispatch<boolean>;
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
    const [componentProps, setComponentProps] = React.useState({});

    React.useEffect(() => {
        function handlePanelOpen(evt) {
            const detail = evt.detail;
            if (detail && detail.id === props.id) {
                if (detail.props) {
                    setComponentProps(detail.props);
                }
                setIsOpen(detail.open);
            }
        }
        document.addEventListener(PANEL_OPEN_EVT, handlePanelOpen);
        return () =>
            document.removeEventListener(PANEL_OPEN_EVT, handlePanelOpen);
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
                headerText={props?.headerText || ''}
                onRenderFooterContent={() => footer}
                isFooterAtBottom={props?.isFooterAtBottom || false}
                type={props?.type || PanelType.smallFixedFar}
            >
                <RenderComponent
                    setFooter={setFooter}
                    setOpen={setIsOpen}
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
