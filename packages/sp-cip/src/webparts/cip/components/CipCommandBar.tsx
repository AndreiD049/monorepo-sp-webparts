import { debounce } from '@microsoft/sp-lodash-subset';
import {
    CommandBar,
    Dropdown,
    IconButton,
    IDropdownOption,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import useWebStorage from 'use-web-storage-api';
import { relinkParent } from '../utils/dom-events';
import styles from './CommandBar.module.scss';

interface ICipCommandBarProps {
    onSearch: (val: string) => void;
    onStatusSelectedChange: (newStatus: StatusSelected) => void;
    onAssignedToChange: (newAssigned: AssigneeSelected) => void;
}

export enum StatusSelected {
    Open,
    Finished,
    All,
}

const CipStatusSelector: React.FC<{
    onSelectedChange: (val: StatusSelected) => void;
}> = (props) => {
    const [selected, setSelected] = useWebStorage<StatusSelected>(
        StatusSelected.Open,
        { key: 'sp-cip-status-selected' }
    );

    const handleSelectedChange = (ev, opt: IDropdownOption) => {
        setSelected(+opt.key);
    };

    React.useEffect(() => {
        props.onSelectedChange(selected);
    }, [selected]);

    return (
        <div className={styles['status-selector']}>
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

export enum AssigneeSelected {
    Single,
    All,
    None,
}

/**
 * If target is equal to value, return the appropriate classname, else, return empty string
 */
function isSelectedClassName(
    target: AssigneeSelected,
    value: AssigneeSelected
) {
    if (target === value) {
        return styles['asignee-selector__item_selected'];
    }
    return '';
}

const CipAssigneeSelector: React.FC<{
    onAssignedToChange: (val: AssigneeSelected) => void;
}> = (props) => {
    const [selected, setSelected] = useWebStorage<AssigneeSelected>(
        AssigneeSelected.Single,
        { key: 'sp-cip-assigned-to' }
    );

    React.useEffect(() => {
        props.onAssignedToChange(selected);
    }, [selected]);

    const handleClick = (value: AssigneeSelected) => () => {
        setSelected(value);
    };

    return (
        <div className={styles['asignee-selector']}>
            <IconButton
                className={`${
                    styles['asignee-selector__item']
                } ${isSelectedClassName(AssigneeSelected.Single, selected)}`}
                iconProps={{ iconName: 'Contact' }}
                onClick={handleClick(AssigneeSelected.Single)}
                title="Assigned to me"
            />
            <IconButton
                className={`${styles['asignee-selector__item']} ${
                    styles['assignee-selector__separator']
                } ${isSelectedClassName(AssigneeSelected.All, selected)}`}
                iconProps={{ iconName: 'People' }}
                onClick={handleClick(AssigneeSelected.All)}
                title="Assigned to anyone"
            />
        </div>
    );
};

const CipCommandBar: React.FC<ICipCommandBarProps> = (props) => {
    const handleSearch = React.useCallback(
        debounce((_ev: any, value: string) => {
            props.onSearch(value);
            relinkParent('all');
        }, 1000),
        [props.onSearch]
    );
    const navigate = useNavigate();

    return (
        <>
            <CommandBar
                items={[
                    {
                        key: 'new',
                        text: 'New task',
                        iconProps: {
                            iconName: 'Add',
                        },
                        onClick: () => navigate('new'),
                    },
                ]}
                farItems={[
                    {
                        key: 'status',
                        onRender: () => (
                            <CipStatusSelector
                                onSelectedChange={props.onStatusSelectedChange}
                            />
                        ),
                    },
                    {
                        key: 'asignee',
                        onRender: () => (
                            <CipAssigneeSelector
                                onAssignedToChange={props.onAssignedToChange}
                            />
                        ),
                    },
                    {
                        key: 'search',
                        onRender: () => (
                            <SearchBox
                                styles={{ root: { alignSelf: 'center' } }}
                                autoComplete="off"
                                onChange={handleSearch}
                                id="sp-cip-quick-search"
                                placeholder="Quick search..."
                            />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default CipCommandBar;
