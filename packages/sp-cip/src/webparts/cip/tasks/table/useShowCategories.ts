import * as React from 'react'

export const useShowCategories = () => {
  const [showCategories, setShowCategories] = React.useState(true);

  const handleToggleShowCategories = React.useCallback((value: boolean) => {
    setShowCategories(value);
  }, []);

  return ({
    showCategories,
    handleToggleShowCategories
  });
};
