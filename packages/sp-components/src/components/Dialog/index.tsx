import { IDialogProps, Dialog as FluentDialog, DialogFooter } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './Dialog.module.scss';

const EVENT_PREFIX = 'sp-dialog-visibility';
const getEventName = (id: string) => `${EVENT_PREFIX}/${id}`;

interface IDialogEventProps {
    id: string;
    dialogProps: IDialogProps;
    content?: JSX.Element;
    footer?: JSX.Element;
    visible: boolean;
}

export interface ISPDialogProps {
    id: string;
}

export function showDialog(props: Omit<IDialogEventProps, 'visible'>) {
    document.dispatchEvent(
        new CustomEvent<IDialogEventProps>(getEventName(props.id), {
            detail: {
                ...props,
                visible: true,
            },
        })
    );
}

export function hideDialog(id: string) {
    document.dispatchEvent(
        new CustomEvent<IDialogEventProps>(getEventName(id), {
            detail: {
                visible: false,
                id,
                dialogProps: {},
            },
        })
    );
}

export const Dialog: React.FC<ISPDialogProps> = (props) => {
    const evtName = getEventName(props.id);
    const [dialogProps, setDialogProps] = React.useState<IDialogProps>({});
    const [visible, setVisible] = React.useState<boolean>(false);
    const [content, setContent] = React.useState<JSX.Element>(null);
    const [footer, setFooter] = React.useState<JSX.Element>(null);

    React.useEffect(() => {
        function handler(evt: CustomEvent<IDialogEventProps>) {
            setDialogProps(evt.detail.dialogProps);
            setVisible(evt.detail.visible);
            if (evt.detail.content) {
                setContent(evt.detail.content);
            }
            if (evt.detail.footer) {
                setFooter(evt.detail.footer);
            }
        }
        document.addEventListener(evtName, handler);
        return () => document.removeEventListener(evtName, handler);
    }, [props.id]);

    return (
        <FluentDialog hidden={!visible} minWidth="initial" maxWidth="initial" {...dialogProps} onDismiss={() => {
            dialogProps.onDismiss && dialogProps.onDismiss();
            hideDialog(props.id);
        }}>
            {content}
            {footer && <DialogFooter>{footer}</DialogFooter>}
        </FluentDialog>
    );
};
