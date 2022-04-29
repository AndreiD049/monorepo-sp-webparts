import * as React from 'react';
import { useTasks } from '../tasks/useTasks';
import { ICipProps } from './ICipProps';

const Cip: React.FC<ICipProps> = ({properties}) => {
  const { getAll, getNonFinishedMains } = useTasks(properties.tasksListName);
  
  getNonFinishedMains().then((result) => console.log(result));

  return (<div>test</div>)
};

export default Cip;