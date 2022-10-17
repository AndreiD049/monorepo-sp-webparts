import { Toggle } from "office-ui-fabric-react";
import * as React from "react";
import useWebStorage from "use-web-storage-api";

export interface ICipCategoriesToggleProps {
    onShowCategoriesToggle: (val: boolean) => void;
}

export const CipCategoriesToggle: React.FC<ICipCategoriesToggleProps> = (props) => {
    const [value, setValue] = useWebStorage<boolean>(true, {
        key: 'spCipShowCategories',
    });

    React.useEffect(() => {
        props.onShowCategoriesToggle(value);
    }, [value]);

    return (
        <Toggle
            styles={{
                root: {
                    marginBottom: 0,
                    marginRight: '.5em',
                },
            }}
            onText="Categories"
            offText="Categories"
            inlineLabel
            checked={value}
            onChange={(_ev: {}, checked: boolean) => setValue(checked)}
        />
    );
};