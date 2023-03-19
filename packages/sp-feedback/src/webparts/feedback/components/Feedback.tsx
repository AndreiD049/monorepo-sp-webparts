import * as React from 'react';
import { RouterProvider } from 'react-router';
import { ISiteUserInfo } from 'sp-preset';
import { ADMINS, DIALOG_ID, MAIN_CALLOUT } from '../constants';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';
import { $eq } from '../indexes/filter';
import { IndexManager } from '../indexes/index-manager';
import {
    itemAddedEventBuilder,
    itemDeletedEventBuilder,
    itemUpdatedEventBuilder,
} from '../services/events';
import { MainService } from '../services/main-service';
import { router } from './Router';
import { Item } from '../item';
import styles from './Feedback.module.scss';
import '../styles.scss';
import { Callout, Dialog, Footer } from 'sp-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
            const tempItems = MainService.TempItemService.getAllTempItems();

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
        const [updateEvent, handlerUpdate, removeUpdate] =
            itemUpdatedEventBuilder(
                MainService.ItemsService,
                MainService.TempItemService,
                info.indexManager,
                (oldItem, newItem) => {
                    setInfo((prev) => ({
                        ...prev,
                        indexManager: prev.indexManager.itemUpdated(
                            oldItem,
                            newItem
                        ),
                    }));
                }
            );

        // Delete item
        const [deleteEvent, handleDelete, removeDelete] =
            itemDeletedEventBuilder(
                MainService.ItemsService,
                MainService.TempItemService,
                (id) => {
                    setInfo((prev) => ({
                        ...prev,
                        indexManager: prev.indexManager.itemRemoved(id),
                    }));
                }
            );

        // Listen to events
        document.addEventListener(addEvent, handlerItemAdd);
        document.addEventListener(updateEvent, handlerUpdate);
        document.addEventListener(deleteEvent, handleDelete);

        // remove event listeners
        return () => {
            removeItemAdd();
            removeUpdate();
            removeDelete();
        };
    }, [info?.indexManager]);

    if (!info) return null;

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={styles.feedback}>
                <GlobalContext.Provider value={info}>
                    <RouterProvider router={router} />
                </GlobalContext.Provider>
                <Dialog id={DIALOG_ID} />
                <Callout id={MAIN_CALLOUT} />
                <Footer email={props.properties.config.supportEmail} />
            </div>
        </DndProvider>
    );
};
