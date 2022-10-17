import * as React from 'react';

export const useShowCategories = (): {
    showCategories: boolean;
    handleToggleShowCategories: (val: boolean) => void;
} => {
    const [showCategories, setShowCategories] = React.useState(true);

    const handleToggleShowCategories = React.useCallback((value: boolean) => {
        setShowCategories(value);
    }, []);

    return {
        showCategories,
        handleToggleShowCategories,
    };
};
