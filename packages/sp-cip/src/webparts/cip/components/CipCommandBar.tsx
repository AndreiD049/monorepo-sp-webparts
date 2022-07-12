import { debounce } from '@microsoft/sp-lodash-subset';
import {
    CommandBar,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { relinkParent } from '../utils/dom-events';

interface ICipCommandBarProps {
    onSearch: (val: string) => void;
}

const CipCommandBar: React.FC<ICipCommandBarProps> = (props) => {
    const handleSearch = React.useCallback(debounce((_ev: any, value: string) => {
        props.onSearch(value);
        relinkParent('all');
    }, 1000), [props.onSearch]);
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
                    }
                ]}
                farItems={[
                    {
                        key: 'search',
                        onRender: () => (
                            <SearchBox autoComplete='off' onChange={handleSearch} id="sp-cip-quick-search" placeholder="Quick search..." />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default CipCommandBar;
