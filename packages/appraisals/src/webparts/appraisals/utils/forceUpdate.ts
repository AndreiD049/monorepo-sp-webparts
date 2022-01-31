import * as React from "react";

function useForceUpdate() {
    const [update, setUpdate] = React.useState<boolean>(false);
    const callback = React.useCallback(() => {
        setUpdate(val => !val);
    }, [update]);

    return callback;
}

export default useForceUpdate;

