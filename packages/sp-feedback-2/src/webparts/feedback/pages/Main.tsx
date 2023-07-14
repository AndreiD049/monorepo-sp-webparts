import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationBar } from '../components/NavigationBar';
import { GlobalContextProvider, RequestTypesDict } from '../Context';
import {
    getRequestTypes,
} from '../features/feedback-form/request-types';
import { FeedbackModal } from '../features/feedback/FeedbackModal';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';

export const Main: React.FC<IFeedbackWebPartProps> = (props) => {
    const [requestTypes, setRequestTypes] = React.useState<RequestTypesDict>(
        {}
    );

    React.useEffect(() => {
        getRequestTypes()
            .then((types) => {
                const typesDict = types.reduce((dict, type) => {
                    dict[type.Data.code] = type;
                    return dict;
                }, {} as RequestTypesDict);
                setRequestTypes(typesDict);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <GlobalContextProvider
            listRootUrl={props.listRootUrl}
            listTitle={props.listTitle}
            settingListTitle={props.settingListTitle}
			requestTypes={requestTypes}
        >
            <NavigationBar
                links={[
                    { name: 'Home', to: '/', icon: 'Home' },
                    { name: 'New feedback', to: '/new', icon: 'Add' },
                    { name: 'Board', to: '/board', icon: 'BacklogBoard' },
                    { name: 'Explore', to: '/explore', icon: 'ExploreContent' },
                ]}
                farLinks={[
                    { name: 'Settings', to: '/settings', icon: 'Settings' },
                ]}
            />
            <Outlet />
            <FeedbackModal />
        </GlobalContextProvider>
    );
};
