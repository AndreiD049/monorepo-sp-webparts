import {
    CommandBar,
    PanelType,
    PrimaryButton,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import CreateTaskPanel from '../tasks/Panels/CreateTask';
import { PANEL_OPEN_EVT } from '../utils/constants';
import { CREATE_PANEL_ID } from './useCipPanels';
import usePanel from './usePanel';

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
                        onClick: () =>
                            document.dispatchEvent(
                                new CustomEvent(PANEL_OPEN_EVT, {
                                    detail: { id: CREATE_PANEL_ID, open: true },
                                })
                            ),
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
