import {
    CommandBar,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility, openPanel } from '../utils/dom-events';
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
                    }
                ]}
                farItems={[
                    {
                        key: 'search',
                        onRender: () => (
                            <SearchBox id="sp-cip-quick-search" placeholder="Quick search..." />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default CipCommandBar;
