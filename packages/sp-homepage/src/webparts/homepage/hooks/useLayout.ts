import React from "react";
import { Layout, Layouts } from "react-grid-layout";
import useWebStorage from "use-web-storage-api";
import IConfig from "../models/IConfig";
import IUser from "../models/IUser";

export function getLayoutKey(currentUser?: IUser, selectedUser?: IUser): string {
    if (currentUser && selectedUser) {
        return currentUser.Id === selectedUser.Id ? 'Self' : 'Other';
    }
    return 'Default';
}

export const useLayout = (currentUser: IUser, selectedUser: IUser, config: IConfig) => {
    const [layouts, setLayouts] = useWebStorage<{ [key: string]: Layouts }>(
        {
            'Default': config.defaultLayouts,
            'Self': config.defaultLayouts,
            'Other': config.defaultLayouts,
        },
        {
            key: config.layoutsLocalStorageKey,
        }
    );

    const handleLayoutChange = React.useCallback((_layouts: Layout[], allLayouts: Layouts) => {
        setLayouts((prev) => ({
            ...prev,
            [getLayoutKey(currentUser, selectedUser)]: allLayouts,
        }));
    }, [currentUser, selectedUser])

    return {
        layout: layouts[getLayoutKey(currentUser, selectedUser)],
        handleLayoutChange
    };
}