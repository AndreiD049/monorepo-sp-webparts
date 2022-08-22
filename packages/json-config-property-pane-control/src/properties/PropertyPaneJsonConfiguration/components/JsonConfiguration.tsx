import { debounce } from "@microsoft/sp-lodash-subset";
import { MessageBar, MessageBarType, TextField } from "office-ui-fabric-react";
import * as React from "react";
import JsonConfigurationService from "../services/JsonConfigurationService";
import { IJsonConfigurationProps } from "./IJsonConfigurationProps";
import styles from "./JsonConfiguration.module.scss";

export const JsonConfiguration: React.FC<IJsonConfigurationProps> = (props) => {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [fileName, setFileName] = React.useState(props.value?.sourcePath || "");
  const [value, setValue] = React.useState(
    JSON.stringify(props.value?.value, null, 4) || ""
  );

  const changeContents = (content: string) => {
    setValue(content);
    try {
      const val = JSON.parse(content);
      props.onChange(val);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("JSON is invalid");
    }
  };

  const fetchFileContents = async (path: string) => {
    try {
      const contents = await JsonConfigurationService.getFileContents(path);
      changeContents(JSON.stringify(contents, null, 4));
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err);
    }
  };

  React.useEffect(() => {
    async function run(): Promise<void> {
      if (fileName) {
        await fetchFileContents(fileName);
      }
    }
    run().catch((err) => console.error(err));
  }, []);

  const updateContents = async (filename: string) =>
    await fetchFileContents(filename);

  const handleChangeFilename = (_ev: {}, newValue: string): void => {
    setFileName(newValue);
    props.onFilenameChange(newValue);
    void updateContents(newValue);
  };

  const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newVal = ev.target.value;
    changeContents(newVal);
  };

  return (
    <div>
      <TextField
        label="File path"
        value={fileName}
        onChange={handleChangeFilename}
        autoComplete="off"
      />
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
    </div>
  );
};
