import { openDatabase, removeCached } from 'idb-proxy';
import { ActionButton, PanelType, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { Panel, showPanel } from 'sp-components';
import { IFeedbackItem } from '../../../models/IFeedbackItem';
import {
    APPLICATION,
    DB_NAME,
    FEEDBACK,
    MAIN_PANEL,
    STORE_NAME,
} from '../constants';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';
import { IndexManager } from '../indexes/index-manager';
import { Item } from '../item';
import { ITEM_ADDED } from '../services/events';
import { MainService } from '../services/main-service';
import styles from './Feedback.module.scss';
import { FeedbackForm } from './FeedbackForm';
import { ItemTemplate } from './ItemTemplate';
import { SelectDropdown } from './SelectDropdown';

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
                <PrimaryButton
                    onClick={() => {
                        showPanel(
                            MAIN_PANEL,
                            {
                                headerText: 'Add feedback',
                                type: PanelType.large,
                            },
                            <FeedbackForm />
                        );
                    }}
                >
                    Leave feedback
                </PrimaryButton>
                <ActionButton
                    iconProps={{ iconName: 'Refresh' }}
                    onClick={async () => {
                        const db = await openDatabase(DB_NAME, STORE_NAME);
                        await removeCached(db, /.*/);
                        location.reload();
                    }}
                />
                {info.indexManager.getArrayBy('tag', FEEDBACK).map((i) => (
                    <ItemTemplate
                        style={{ marginTop: '.5em' }}
                        item={i}
                        key={i.Id}
                    />
                ))}
                {info.indexManager.getArrayBy('tag', FEEDBACK).map((i) => {
                    return (
                        <SelectDropdown
                            key={i.Id}
                            options={info.indexManager.getArrayBy(
                                'tag',
                                APPLICATION
                            )}
                            target={i}
                            field="application"
                            onChange={async (result) => {
                                await MainService.ItemsService.updateItem(result.Id, result.asRaw());
                                info.indexManager.itemUpdated(i, result);
                                setInfo((prev) => ({
                                    ...prev,
                                }));
                                
                            }}
                            dropDownProps={{
                                label: 'Application'
                            }}
                        />
                    );
                })}
                <Panel id={MAIN_PANEL} />
            </GlobalContext.Provider>
        </div>
    );
};
