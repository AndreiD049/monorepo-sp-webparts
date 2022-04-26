import { runInContext } from "lodash";
import { Label, TextField } from "office-ui-fabric-react";
import * as React from "react";
import { PropertyPaneJsonConfBuilder } from "./PropertyPaneJsonConf";

export interface IJsonConfigurationProps {
    label: string;
}

const JsonConfiguration: React.FC<IJsonConfigurationProps> = (props) => {
    const sp = PropertyPaneJsonConfBuilder.SPBuilder.getSP();

    React.useEffect(() => {
        async function run() {
            console.log(await sp.web.siteUsers());
        }
        run();
    }, []);

    return (
        <div>
            <Label>{props.label}</Label>
            <TextField
                label="Json file path"
                description="Server relative file path. Ex: /sites/Admin-tools/CDN/webpart-a-config.json"
                onGetErrorMessage={(value: string) => {
                    const re = /\/sites\/.*\/.*\.json/;
                    if (!re.test(value)) {
                        return 'Not a valid path value. Expected something like \'/sites/MySite/Library/webpart-a-config.json\'';
                    }
                }}
            />
        </div>
    )
};


export default JsonConfiguration;