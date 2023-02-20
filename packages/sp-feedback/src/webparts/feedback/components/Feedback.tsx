import { PanelType, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { Panel, showPanel } from 'sp-components';
import { IFeedbackItem } from '../../../models/IFeedbackItem';
import { FEEDBACK, MAIN_PANEL } from '../constants';
import { IFeedbackWebPartProps } from '../FeedbackWebPart';
import { buildIndex, Index } from '../services';
import { ITEM_ADDED } from '../services/events';
import { MainService } from '../services/main-service';
import styles from './Feedback.module.scss';
import { FeedbackForm } from './FeedbackForm';

interface IGlobalContextProps {
    items: IFeedbackItem[];
    index: Index;
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    items: [],
    index: null,
});

export interface IFeedbackProps {
    properties: IFeedbackWebPartProps;
}

export const Feedback: React.FC<IFeedbackProps> = (props) => {
    const ItemsService = MainService.ItemsService;
    const [info, setInfo] = React.useState<IGlobalContextProps>();

    // Pull information
    React.useEffect(() => {
        ItemsService.getAllItems()
            .then((items) => {
                const index = buildIndex(items);
                setInfo({
                    items,
                    index,
                });
            })
            .catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        function itemAddedHandler(ev: CustomEvent): void {
            setInfo((prev) => {
                const newIndex = prev.index.addItem(ev.detail);
                return {
                    items: newIndex.items,
                    index: newIndex,
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
                {info.index.findByTag(FEEDBACK).map((i) => (
                    <div key={i.Id}>{i.Title}</div>
                ))}
                <Panel id={MAIN_PANEL} />
            </GlobalContext.Provider>
        </div>
    );
};
