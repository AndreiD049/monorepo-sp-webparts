import { Spinner, SpinnerSize } from '@fluentui/react';
import * as React from 'react';

const LOADING_ANIMATION_EVENT: string = 'SP_CIP_LOADING_ANIMATION';

export interface ILoadingEventDetail {
    isVisible: boolean;
    id: string;
}

const dispatch = (id: string, val: boolean): void => {
    document.dispatchEvent(
        new CustomEvent<ILoadingEventDetail>(LOADING_ANIMATION_EVENT, {
            detail: {
                id,
                isVisible: val,
            },
        })
    );
};

export const loadingStart = (id: string = "default"): void => {
    dispatch(id, true);
};

export const loadingStop = (id: string = "default"): void => {
    dispatch(id, false);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withLoading = async (id: string, func: () => any): Promise<void> => {
    try {
        loadingStart(id);
        await func();
    } finally {
        loadingStop(id);
    }
}

export interface ILoadingAnimationProps {
    elementId: string;
    initialOpen?: true;
}

export const LoadingAnimation: React.FC<ILoadingAnimationProps> = (props) => {
    const [visible, setVisible] = React.useState(props.initialOpen || false);

    React.useEffect(() => {
        function handler(e: CustomEvent<ILoadingEventDetail>): void {
            if (props.elementId === e.detail.id) {
                setVisible(e.detail.isVisible);
            }
        }
        document.addEventListener(LOADING_ANIMATION_EVENT, handler);
        return () =>
            document.removeEventListener(LOADING_ANIMATION_EVENT, handler);
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: 1024,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                top: 0,
                left: 0,
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Spinner
                styles={{
                    circle: {
                        borderWidth: '3px',
                        width: '75px',
                        height: '75px',
                    },
                    label: {
                        fontSize: '1.5em',
                    },
                }}
                size={SpinnerSize.large}
                label="Working..."
            />
        </div>
    );
};
