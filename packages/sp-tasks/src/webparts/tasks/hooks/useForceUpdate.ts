import * as React from 'react';

export const useForceUpdate = (): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [update, setUpdate] = React.useState(false);

  return [update, setUpdate];
};
