import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../../utils/GlobalContext';

const LOADING_ANIMATION_EVENT: string = 'SP_CIP_LOADING_ANIMATION';

export interface ILoadingEventDetail {
    isVisible: boolean;
}

const dispatch = (val: boolean) => {
    document.dispatchEvent(
        new CustomEvent<ILoadingEventDetail>(LOADING_ANIMATION_EVENT, {
            detail: {
                isVisible: val,
            },
        })
    );
};

export const loadingStart = () => {
    dispatch(true);
};

export const loadingStop = () => {
    dispatch(false);
};

export const LoadingAnimation = () => {
    const { theme } = React.useContext(GlobalContext);
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        function handler(e: CustomEvent<ILoadingEventDetail>) {
            setVisible(e.detail.isVisible);
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
                backgroundColor: theme.palette.whiteTranslucent40,
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
