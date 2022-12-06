import {
    IDialogProps,
    Dialog as FluentDialog,
    DialogFooter,
    Stack,
    PrimaryButton,
    DefaultButton,
} from 'office-ui-fabric-react';
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
            setVisible(evt.detail.visible);
            if (evt.detail.visible) {
                setDialogProps(evt.detail.dialogProps);
                setContent(evt.detail.content || null);
                setFooter(evt.detail.footer || null);
            }
        }
        document.addEventListener(evtName, handler);
        return () => document.removeEventListener(evtName, handler);
    }, [props.id]);

    return (
        <FluentDialog
            hidden={!visible}
            minWidth="initial"
            maxWidth="initial"
            {...dialogProps}
            onDismiss={() => {
                dialogProps.onDismiss && dialogProps.onDismiss();
                hideDialog(props.id);
            }}
        >
            {content}
            {footer && (
                <DialogFooter styles={{ actions: { lineHeight: 'initial' } }}>
                    {footer}
                </DialogFooter>
            )}
        </FluentDialog>
    );
};

export type Callback = () => void;

export const FooterYesNo: React.FC<{ onYes: Callback; onNo: Callback }> = (props) => {
    return (
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 5 }}>
            <PrimaryButton onClick={props.onYes}>Yes</PrimaryButton>
            <DefaultButton onClick={props.onNo}>No</DefaultButton>
        </Stack>
    );
};

export const FooterOkCancel: React.FC<{ onOk?: Callback; onCancel: Callback, form?: string }> = (props) => {
    return (
        <Stack horizontal horizontalAlign="start" tokens={{ childrenGap: 5 }}>
            <PrimaryButton onClick={props.onOk ? props.onOk : null} form={props.form} type="submit">Ok</PrimaryButton>
            <DefaultButton onClick={props.onCancel}>Cancel</DefaultButton>
        </Stack>
    );
};

export const FooterOk: React.FC<{ onOk: Callback }> = (props) => {
    return (
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 5 }}>
            <PrimaryButton onClick={props.onOk}>Ok</PrimaryButton>
        </Stack>
    );
};
