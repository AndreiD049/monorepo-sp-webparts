import {
    CommandBar,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { openPanel } from '../utils/dom-events';
import { CREATE_PANEL_ID } from './useCipPanels';

const CipCommandBar = () => {
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
                        onClick: () => openPanel(CREATE_PANEL_ID, true),
                    },
                ]}
                farItems={[
                    {
                        key: 'search',
                        onRender: () => (
                            <SearchBox placeholder="Quick search..." />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default CipCommandBar;
