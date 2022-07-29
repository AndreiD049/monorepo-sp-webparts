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
                    minWidth: '175px',
                },
            }}
            label="Categories"
            onText="Show"
            offText="Hide"
            inlineLabel
            checked={value}
            onChange={(ev: any, checked: boolean) => setValue(checked)}
        />
    );
};