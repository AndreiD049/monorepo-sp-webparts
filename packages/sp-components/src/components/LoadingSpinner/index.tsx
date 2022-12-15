import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './LoadingSpinner.module.scss';

const SPINNER_EVT = 'sp-components-snipper-event';
const evtName = (id: string): string => `${SPINNER_EVT}/${id}`;

export interface ILoadingSpinnerProps {
    id?: string;
}

export function showSpinner(id: string): void {
    document.dispatchEvent(new CustomEvent<{ visible: boolean }>(evtName(id), {
        detail: {
            visible: true,
        }
    }));
}

export function hideSpinner(id: string): void {
    document.dispatchEvent(new CustomEvent<{ visible: boolean }>(evtName(id), {
        detail: {
            visible: false,
        }
    }));
}

export const LoadingSpinner: React.FC<ILoadingSpinnerProps> = (props) => {
    const [visible, setVisible] = React.useState(props.id ? false : true);

    React.useEffect(() => {
        function handler(evt: CustomEvent<{ visible: boolean }>): void {
            setVisible(() => evt.detail.visible);
        }
        if (props.id) {
            // Listen to update event
            document.addEventListener(evtName(props.id), handler)
        }
        return () => document.removeEventListener(evtName(props.id), handler);
    }, [props.id, setVisible]);

    if (!visible) return null;

    return (
        <div className={styles.container}>
            <Spinner size={SpinnerSize.large} label="Please wait" labelPosition={'bottom'} />
        </div>
    );
};
