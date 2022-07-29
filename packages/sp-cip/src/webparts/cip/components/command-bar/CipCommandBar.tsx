import { debounce } from '@microsoft/sp-lodash-subset';
import {
    CommandBar,
    IconButton,
    SearchBox,
    Toggle,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import useWebStorage from 'use-web-storage-api';
import { relinkParent } from '../../utils/dom-events';
import { AssigneeSelected, CipAssigneeSelector } from './CipAssigneeSelector';
import { CipCategoriesToggle } from './CipCategoriesToggle';
import { CipStatusSelector, StatusSelected } from './StatusSelector';

interface ICipCommandBarProps {
    onSearch: (val: string) => void;
    onStatusSelectedChange: (newStatus: StatusSelected) => void;
    onAssignedToChange: (newAssigned: AssigneeSelected) => void;
    onShowCategoriesToggle: (val: boolean) => void;
}

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
                        key: 'toggle_category',
                        onRender: () => (
                            <CipCategoriesToggle
                                onShowCategoriesToggle={
                                    props.onShowCategoriesToggle
                                }
                            />
                        ),
                    },
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
