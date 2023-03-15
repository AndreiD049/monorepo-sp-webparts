import * as React from 'react';
import { RouterProvider } from 'react-router';
import { ISiteUserInfo } from 'sp-preset';
import { ADMINS, DIALOG_ID } from '../constants';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';
import { $eq } from '../indexes/filter';
import { IndexManager } from '../indexes/index-manager';
import { itemAddedEventBuilder, itemUpdatedEventBuilder } from '../services/events';
import { MainService } from '../services/main-service';
import { router } from './Router';
import { Item } from '../item';
import styles from './Feedback.module.scss';
import '../styles.scss'
import { Dialog } from 'sp-components';

interface IGlobalContextProps {
    indexManager: IndexManager;
    currentUser: ISiteUserInfo;
    isAdmin?: boolean;
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    indexManager: null,
    currentUser: null,
    isAdmin: false,
});

export interface IFeedbackProps {
    properties: IFeedbackWebPartProps;
}

export const Feedback: React.FC<IFeedbackProps> = (props) => {
    const ItemsService = MainService.ItemsService;
    const [info, setInfo] = React.useState<IGlobalContextProps>();

    // Pull information
    React.useEffect(() => {
        async function run(): Promise<void> {
            // Get normal items
            const items = await ItemsService.getAllItems();
            // Get system items, those are cached
            const systemItems = (await ItemsService.getAllSystemItems()).map(
                (i) => new Item(i)
            );
            // Get temp items if any
            const tempItems =
                MainService.TempItemService.getAllTempItems();

            // Build items
            const allItems = items.concat(systemItems, tempItems);

            const indexManager = new IndexManager(allItems);
            const admins = indexManager.filterArray($eq('title', ADMINS));
            const currentUser = await MainService.UsersService.getCurrentUser();
            let isAdmin = false;
            if (admins.length > 0) {
                isAdmin =
                    admins[0]
                        .getFieldOr<string[]>('users', [])
                        .find(
                            (u) =>
                                u.toLowerCase() ===
                                currentUser.Email.toLowerCase()
                        ) !== undefined;
            }
            setInfo({
                indexManager,
                isAdmin,
                currentUser,
            });
        }
        run().catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        if (!info?.indexManager) return;
        // Add item
        const [addEvent, handlerItemAdd, removeItemAdd] = itemAddedEventBuilder(
            MainService.ItemsService,
            MainService.TempItemService,
            (item) =>
                setInfo((prev) => ({
                    ...prev,
                    indexManager: prev.indexManager.itemAdded(item),
                }))
        );
        
        // Update item
        const [updateEvent, handlerUpdate, removeUpdate] = itemUpdatedEventBuilder(
            MainService.ItemsService,
            MainService.TempItemService,
            info.indexManager,
            (oldItem, newItem) => {
                setInfo((prev) => ({
                    ...prev,
                    indexManager: prev.indexManager.itemUpdated(oldItem, newItem),
                }))
            }
        )

        // Listen to events
        document.addEventListener(addEvent, handlerItemAdd);
        document.addEventListener(updateEvent, handlerUpdate);

        // remove event listeners
        return () => {
            removeItemAdd();
            removeUpdate();
        };
    }, [info?.indexManager]);

    if (!info) return null;

    return (
        <div className={styles.feedback}>
            <GlobalContext.Provider value={info}>
                <RouterProvider router={router} />
            </GlobalContext.Provider>
            <Dialog id={DIALOG_ID} />
        </div>
    );
};
