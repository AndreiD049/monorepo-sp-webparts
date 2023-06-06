import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalContextProvider } from '../Context';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';

export const Main: React.FC<IFeedbackWebPartProps> = (props) => {
    return (
        <GlobalContextProvider
            listRootUrl={props.listRootUrl}
            listTitle={props.listTitle}
            settingListTitle={props.settingListTitle}
        >
            <Outlet />
        </GlobalContextProvider>
    );
}