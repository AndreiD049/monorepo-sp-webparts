import {
    ButtonType,
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType,
    IDialogContentProps,
    PrimaryButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import {
    dialogVisibility,
    dialogVisibilityHandler,
    IDialogButtonProp,
} from '../utils/dom-events';

const DISMISS_DIALOG_EVT = 'sp-cip-dismiss-dialog';

export enum DIALOG_IDS {
    MAIN = "MAIN",
    DETAILS_PANEL = "DETAILS_PANEL",
    ACTIONLOG_PANEL = "ACTIONLOG_PANEL",
}

const defaultProps = {
    type: DialogType.normal,
    title: 'Dialog',
    closeButtonAriaLabel: 'Close',
};

interface IGetAlertProps {
    alertId: DIALOG_IDS;
    title: string;
    subText?: string;
    buttons?: IDialogButtonProp[];
    Component?: JSX.Element;
}

export const getDialog = async (props: IGetAlertProps): Promise<string> => {
    return new Promise<string>((resolve) => {
        dialogVisibility({
            alertId: props.alertId,
            contentProps: {
                ...defaultProps,
                title: props.title,
                subText: props.subText,
            },
            buttons: props.buttons,
            onBeforeDismiss: (answer) => resolve(answer),
            hidden: false,
            Component: props.Component,
        });
    });
};

export const dismissDialog = (id: string, answer?: string | boolean): void => {
    document.dispatchEvent(
        new CustomEvent(DISMISS_DIALOG_EVT, {
            detail: {
                id,
                answer: answer,
            },
        })
    );
};

export interface IAlertDialogProps {
    alertId: string;
}

export const AlertDialog: React.FC<IAlertDialogProps> = ({ alertId }) => {
    const [hidden, setHidden] = React.useState(true);
    const [contentProps, setContentProps] =
        React.useState<IDialogContentProps>(defaultProps);
    const [buttons, setButtons] = React.useState<IDialogButtonProp[]>([]);
    const [beforeDismiss, setBeforeDismiss] = React.useState(null);
    const [Component, setComponent] = React.useState(<></>);

    const handleDismiss = React.useCallback(
        (answer) => () => {
            // eslint-disable-next-line no-unused-expressions
            beforeDismiss && beforeDismiss(answer);
            setHidden(true);
        },
        [beforeDismiss]
    );

    React.useEffect(() => {
        const removeShow = dialogVisibilityHandler((props) => {
            if (props.alertId === alertId) {
                setHidden(props.hidden);
                setContentProps(props.contentProps);
                setButtons(props.buttons);
                setBeforeDismiss(() => props.onBeforeDismiss);
                setComponent(props.Component || <></>);
            }
        });
        const dismissHanler = (evt: CustomEvent<{ id: string, answer?: string | boolean }>): void => {
            if (evt.detail.id === alertId) {
                // eslint-disable-next-line no-unused-expressions
                beforeDismiss && beforeDismiss(evt.detail.answer);
                setHidden(true);
            }
        };
        document.addEventListener(DISMISS_DIALOG_EVT, dismissHanler);
        return () => {
            removeShow();
            document.removeEventListener(DISMISS_DIALOG_EVT, dismissHanler);
        };
    }, [beforeDismiss]);

    const buttonElements = React.useMemo(() => {
        if (hidden) return null;
        if (!buttons) return null;
        return buttons.map((button) => {
            if (
                button.type === ButtonType.primary ||
                button.type === undefined
            ) {
                return (
                    <PrimaryButton
                        key={button.key}
                        onClick={handleDismiss(button.key)}
                    >
                        {button.text}
                    </PrimaryButton>
                );
            } else {
                return (
                    <DefaultButton
                        key={button.key}
                        onClick={handleDismiss(button.key)}
                    >
                        {button.text}
                    </DefaultButton>
                );
            }
        });
    }, [buttons, hidden, beforeDismiss]);

    return (
        <Dialog
            maxWidth="100vw"
            hidden={hidden}
            isBlocking
            onDismiss={handleDismiss(null)}
            dialogContentProps={contentProps}
        >
            {Component}
            {buttons && <DialogFooter>{buttonElements}</DialogFooter>}
        </Dialog>
    );
};
