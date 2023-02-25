import * as React from 'react';
import { RouterProvider } from 'react-router';
import { IFeedbackItem } from '../../../models/IFeedbackItem';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';
import { IndexManager } from '../indexes/index-manager';
import { Item } from '../item';
import { ITEM_ADDED } from '../services/events';
import { MainService } from '../services/main-service';
import styles from './Feedback.module.scss';
import { router } from './Router';

interface IGlobalContextProps {
    items: IFeedbackItem[];
    indexManager: IndexManager;
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    items: [],
    indexManager: null,
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
            const items = await ItemsService.getAllItems();
            const systemItems = await ItemsService.getAllSystemItems();
            const allItems = items.concat(systemItems).map((i) => new Item(i));
            const indexManager = new IndexManager(allItems);
            setInfo({
                items: allItems,
                indexManager,
            });
        }
        run().catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        function itemAddedHandler(ev: CustomEvent): void {
            setInfo((prev) => {
                prev.indexManager.itemAdded(ev.detail);
                return {
                    items: prev.indexManager.items,
                    indexManager: prev.indexManager,
                };
            });
        }
        document.addEventListener(ITEM_ADDED, itemAddedHandler);
        return () => {
            document.removeEventListener(ITEM_ADDED, itemAddedHandler);
        };
    }, []);

    if (!info) return null;

    return (
        <div className={styles.feedback}>
            <GlobalContext.Provider value={info}>
                <RouterProvider router={router} />
            </GlobalContext.Provider>
        </div>
    );
};
