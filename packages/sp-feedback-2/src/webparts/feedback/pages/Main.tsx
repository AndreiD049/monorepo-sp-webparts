import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationBar } from '../components/NavigationBar';
import { GlobalContextProvider } from '../Context';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';

export const Main: React.FC<IFeedbackWebPartProps> = (props) => {
    return (
        <GlobalContextProvider
            listRootUrl={props.listRootUrl}
            listTitle={props.listTitle}
            settingListTitle={props.settingListTitle}
        >
            <NavigationBar
                links={[
                    { name: 'Home', to: '/', icon: 'Home' },
                    { name: 'New feedback', to: '/new', icon: 'Add' },
                    { name: 'Board', to: '/board', icon: 'BacklogBoard' },
                    { name: 'Explore', to: '/explore', icon: 'ExploreContent' },
                ]}
                farLinks={[{ name: 'Settings', to: '/settings', icon: 'Settings' }]}
            />
            <Outlet />
        </GlobalContextProvider>
    );
};
