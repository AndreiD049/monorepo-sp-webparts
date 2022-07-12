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

const defaultProps = {
    type: DialogType.normal,
    title: 'Dialog',
    closeButtonAriaLabel: 'Close',
};

interface IGetAlertProps {
    alertId: string;
    title: string;
    subText: string;
    buttons: IDialogButtonProp[];
}

export const getAlert = async (props: IGetAlertProps) => {
    return new Promise<any>((resolve) => {
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
        });
    });
};

export interface IAlertDialogProps {
    alertId: string
}

export const AlertDialog: React.FC<IAlertDialogProps>= ({alertId}) => {
    const [hidden, setHidden] = React.useState(true);
    const [contentProps, setContentProps] =
        React.useState<IDialogContentProps>(defaultProps);
    const [buttons, setButtons] = React.useState<IDialogButtonProp[]>([]);
    const [beforeDismiss, setBeforeDismiss] = React.useState(null);

    React.useEffect(() => {
        const removeEvent = dialogVisibilityHandler((props) => {
            if (props.alertId === alertId) {
                setHidden(props.hidden);
                setContentProps(props.contentProps);
                setButtons(props.buttons);
                setBeforeDismiss((prev) => props.onBeforeDismiss);
            } 
        });
        return () => removeEvent();
    }, []);

    const handleDismiss = React.useCallback(
        (answer) => () => {
            beforeDismiss && beforeDismiss(answer);
            setHidden(true);
        },
        [hidden]
    );

    const buttonElements = React.useMemo(() => {
        if (hidden) return null;
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
            hidden={hidden}
            onDismiss={() => handleDismiss(null)}
            dialogContentProps={contentProps}
        >
            <DialogFooter>
                {buttonElements}
            </DialogFooter>
        </Dialog>
    );
};
