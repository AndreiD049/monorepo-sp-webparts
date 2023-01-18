import * as React from 'react';
import { Log, FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import styles from './MsdsForm.module.scss';

export interface IMsdsFormProps {
  context: FormCustomizerContext;
  displayMode: FormDisplayMode;
  onSave: () => void;
  onClose: () => void;
}

const LOG_SOURCE: string = 'MsdsForm';

export default class MsdsForm extends React.Component<IMsdsFormProps, {}> {
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: MsdsForm mounted');
  }

  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: MsdsForm unmounted');
  }

  public render(): React.ReactElement<{}> {
    return <div className={styles.msdsForm}>test</div>;
  }
}
