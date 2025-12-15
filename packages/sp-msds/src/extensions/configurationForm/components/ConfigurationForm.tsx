import * as React from 'react';
import { Log, FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import styles from './ConfigurationForm.module.scss';

export interface IConfigurationFormProps {
  context: FormCustomizerContext;
  displayMode: FormDisplayMode;
  onSave: () => void;
  onClose: () => void;
}

const LOG_SOURCE: string = 'ConfigurationForm';

export default class ConfigurationForm extends React.Component<IConfigurationFormProps> {
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: ConfigurationForm mounted');
  }

  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: ConfigurationForm unmounted');
  }

  public render(): React.ReactElement<IConfigurationFormProps> {
    return <div className={styles.configurationForm} />;
  }
}
