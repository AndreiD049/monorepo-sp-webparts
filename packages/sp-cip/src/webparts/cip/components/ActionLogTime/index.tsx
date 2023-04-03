import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { showDialog } from 'sp-components';
import { DIALOG_ID_PANEL } from '../../utils/constants';
import { GlobalContext } from '../../utils/GlobalContext';
import { formatHours } from '../../utils/hours-duration';
import { TimeLog } from '../TimeLog';
import styles from './ActionLogTime.module.scss';

export interface IActionLogTimeProps {
  action: IAction;
  task: ITaskOverview;
}

const iconButtonStyles = {
  root: {
    width: 20,
    height: 20,
  },
  icon: {
    fontSize: '.9em',
  },
};

export const ActionLogTime: React.FC<IActionLogTimeProps> = (props) => {
  const { currentUser } = React.useContext(GlobalContext);
  const [logged, setLogged] = React.useState(0);
  const [comment, setComment] = React.useState('');

  React.useEffect(() => {
    const indexOfPipe = props.action.Comment.indexOf('|');
    setLogged(Number.parseFloat(props.action.Comment.substring(0, indexOfPipe)));
    setComment(props.action.Comment.substring(indexOfPipe + 1))
  }, []);

  const handleEdit = (): void => {
    showDialog({
      id: DIALOG_ID_PANEL,
      dialogProps: { title: 'Log time', },
      content: (<TimeLog task={props.task} dialogId={DIALOG_ID_PANEL} action={props.action} />)
    })
  };

  return (
    <div className={styles.container}>
      <div className={styles.topHeader}>
        <div>Time log: {formatHours(logged)} hour(s)</div>
        {(currentUser.Id === props.action.Author.Id || currentUser.Id === props.action.User?.Id) &&
          <IconButton styles={iconButtonStyles} onClick={handleEdit} iconProps={{ iconName: 'Edit' }} />
        }
      </div>
      {comment && (
        <div className={styles.comment}>
          <Text variant="medium">{comment}</Text>
        </div>
      )}
    </div>
  );
};
