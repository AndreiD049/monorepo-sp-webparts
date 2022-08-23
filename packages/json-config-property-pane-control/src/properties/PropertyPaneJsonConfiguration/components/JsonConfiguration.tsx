import { DefaultButton, MessageBar, MessageBarType, TextField } from "office-ui-fabric-react";
import * as React from "react";
import { getConfigValue } from "../PropertyPaneJsonConfiguration";
import JsonConfigurationService from "../services/JsonConfigurationService";
import { IJsonConfigurationProps } from "./IJsonConfigurationProps";
// @ts-nocheck
import styles from './JsonConfiguration.module.scss'

export const JsonConfiguration: React.FC<IJsonConfigurationProps> = (props) => {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [fileName, setFileName] = React.useState(props.value?.__source || "");
  const [value, setValue] = React.useState(
    JSON.stringify(getConfigValue(props.value), null, 4) || ""
  );
  const parentFolder = React.useMemo(() => fileName.split('/').slice(0, -1).join('/'), [fileName])
  const [unsaved, setUnsaved] = React.useState(false);
  const [isJsonValid, setIsJsonValid] = React.useState(true);

  const updateContents = (content: JSON) => {
    try {
      const str = JSON.stringify(content, null, 4);
      const json = JSON.parse(str);
      setValue(str);
      setUnsaved(false);
      props.onChange(fileName, json);
    } catch (err) {
      setIsJsonValid(false);
    }
  }

  const handleLoad = React.useCallback(async () => {
    try {
      const content = await JsonConfigurationService.getFileContents(fileName);
      updateContents(content);
      setErrorMessage('');
    } catch (e) {
      setErrorMessage(e);
    }
  }, [fileName]);

  const handleChange = (ev: {}, val: string) => {
    try {
      setValue(val);
      setUnsaved(true);
      const json = JSON.parse(val);
      setIsJsonValid(true);
    } catch {
      setIsJsonValid(false);
    }
  };

  const handleSave = async () => {
    props.onChange(fileName, JSON.parse(value));
    await JsonConfigurationService.updateFileContents(fileName, value);
  }

  const handleClickLink = (ev: React.MouseEvent) => {
    ev.preventDefault();
    window.open(`${parentFolder}/Forms/AllItems.aspx?id=${fileName}&parent=${parentFolder}&p=5`, '_blank');
    return false;
  }

  return (
    <div>
      <div className={styles.fileName}>
        <TextField
          className={styles.fileNameInput}
          label="File path"
          value={fileName}
          onChange={(ev, val) => setFileName(val)}
          autoComplete="off"
        />
        <DefaultButton onClick={handleLoad}>Load</DefaultButton>
      </div>
      <a onClick={handleClickLink} href="#">Edit</a>
      <TextField
        label="File contents"
        onChange={handleChange}
        value={value}
        multiline
        autoAdjustHeight
      />
      {errorMessage && (
        <MessageBar messageBarType={MessageBarType.error}>
          {errorMessage}
        </MessageBar>
      )}
      {!isJsonValid && (
        <MessageBar messageBarType={MessageBarType.error}>
          JSON is invalid
        </MessageBar>
      )}
      {
        unsaved && (
          <DefaultButton onClick={handleSave} className={styles.saveButton} disabled={!isJsonValid}>Save</DefaultButton>
        )
      }
    </div>
  );
};
