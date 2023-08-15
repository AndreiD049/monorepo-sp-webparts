import { canCurrentUser } from 'property-pane-access-control';
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationBar } from '../components/NavigationBar';
import { GlobalContextProvider, RequestTypesDict } from '../Context';
import { getApplications } from '../features/applications/applications';
import { IApplication } from '../features/applications/IApplication';
import { getCountries, ICountry } from '../features/feedback-form/countries';
import { getRequestTypes } from '../features/feedback-form/request-types';
import { FeedbackPanel } from '../features/feedback/FeedbackPanel';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';

export const Main: React.FC<IFeedbackWebPartProps> = (props) => {
    const [requestTypes, setRequestTypes] = React.useState<RequestTypesDict>(
        {}
    );
    const [countries, setCountries] = React.useState<ICountry[]>([]);
	const [apps, setApps] = React.useState<IApplication[]>([]);
	const [isTestManager, setIsTestManager] = React.useState<boolean>(false);

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
        getCountries()
            .then((countries) => setCountries(countries))
            .catch((err) => console.error(err));
		getApplications()
			.then((apps) => setApps(apps))
			.catch((err) => console.error(err));
		canCurrentUser('test-managers', props.permissions)
			.then((isTestManager) => setIsTestManager(isTestManager))
			.catch((err) => console.error(err));
    }, []);

    return (
        <GlobalContextProvider
            listRootUrl={props.listRootUrl}
            listTitle={props.listTitle}
            settingListTitle={props.settingListTitle}
            requestTypes={requestTypes}
            countries={countries}
			applications={apps}
			isTestManager={isTestManager}
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
			<FeedbackPanel />
        </GlobalContextProvider>
    );
};
