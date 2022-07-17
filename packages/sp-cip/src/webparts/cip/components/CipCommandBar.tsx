import { debounce } from '@microsoft/sp-lodash-subset';
import { CommandBar, IconButton, SearchBox } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { relinkParent } from '../utils/dom-events';
import styles from './CommandBar.module.scss';

interface ICipCommandBarProps {
    onSearch: (val: string) => void;
    onStatusSelectedChange: (newStatus: StatusSelected) => void;
}

export enum StatusSelected {
    Open,
    Finished,
    All
};

const CipStatusSelector: React.FC<{ onSelectedChange: (val: StatusSelected) => void }> = (props) => {
    const [selected, setSelected] = React.useState(StatusSelected.Open);

    const handleSelectedChange = (ev) => {
        setSelected(+ev.target.value);
    }

    React.useEffect(() => {
        props.onSelectedChange(selected);
    }, [selected]);

    return (
        <div className={styles['status-selector']}>
            <select onChange={handleSelectedChange} value={selected}>
                <option value={StatusSelected.Open}>Open tasks</option>
                <option value={StatusSelected.Finished}>Finished tasks</option>
                <option value={StatusSelected.All}>All tasks</option>
            </select>
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

const CipAssigneeSelector: React.FC = () => {
    const [selected, setSelected] = React.useState<AssigneeSelected>(
        AssigneeSelected.Single
    );

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
                        onRender: () => <CipStatusSelector onSelectedChange={props.onStatusSelectedChange} />
                    },
                    {
                        key: 'asignee',
                        onRender: () => <CipAssigneeSelector />,
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
