import { CommandBar, ContextualMenuItemType, SearchBox, Separator } from 'office-ui-fabric-react';
import * as React from 'react';

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
                        onClick: () => alert('create new task'),
                    },
                ]}
                farItems={[
                    {
                        key: 'search',
                        onRender: () => (<SearchBox />)
                    }
                ]}
            />
        </>
    );
};

export default CipCommandBar;
