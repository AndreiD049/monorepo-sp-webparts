import * as React from "react";
import styles from './CommandBar.module.scss';
import useWebStorage from "use-web-storage-api";
import { Dropdown, IDropdownOption } from "@fluentui/react";

export enum StatusSelected {
    Open,
    Finished,
    All,
}

interface ICipStatusSelectorProps {
    onSelectedChange: (val: StatusSelected) => void;
}

export const CipStatusSelector: React.FC<ICipStatusSelectorProps> = (props) => {
    const [selected, setSelected] = useWebStorage<StatusSelected>(
        StatusSelected.Open,
        { key: 'sp-cip-status-selected' }
    );

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleSelectedChange = (_ev: {}, opt: IDropdownOption) => {
        setSelected(+opt.key);
    };

    React.useEffect(() => {
        props.onSelectedChange(selected);
    }, [selected]);

    return (
        <div className={styles['status-selector']} data-task-status={selected}>
            <Dropdown
                options={[
                    {
                        key: StatusSelected.Open,
                        text: 'Open tasks',
                    },
                    {
                        key: StatusSelected.Finished,
                        text: 'Finished tasks',
                    },
                    {
                        key: StatusSelected.All,
                        text: 'All tasks',
                    },
                ]}
                selectedKey={selected}
                onChange={handleSelectedChange}
            />
        </div>
    );
};