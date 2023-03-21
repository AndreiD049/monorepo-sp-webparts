import { isNumber } from 'lodash';
import { IconButton, Modal } from 'office-ui-fabric-react';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ItemTemplate } from '.';
import { $eq } from '../../indexes/filter';
import { GlobalContext } from '../Feedback';
import styles from './ItemModal.module.scss';

const HIDE = 'spfxFeedbackHideModal';
const SHOW = 'spfxFeedbackShowModal';

export function showModal(id: number): void {
    document.dispatchEvent(new CustomEvent<number>(SHOW, { detail: id }));
}

export function hideModal(): void {
    document.dispatchEvent(new CustomEvent(HIDE));
}

export const ItemModal: React.FC = () => {
    const { indexManager } = React.useContext(GlobalContext);
    const [search, setSearchParams] = useSearchParams();
    const itemId = search.get('display');
    const [shown, setShown] = React.useState(itemId !== null);
    const item = React.useMemo(() => {
        if (itemId === null) return null;
        return indexManager.filterFirst($eq('id', itemId));
    }, [itemId]);

    React.useEffect(() => {
        const hideHandler = (): void => {
            setSearchParams((prev) => {
                prev.delete('display');
                setShown(false);
                return prev;
            });
        };

        const showHandler = (ev: CustomEvent<number>): void => {
            if (!isNumber(ev.detail)) return null;
            setSearchParams((prev) => {
                prev.set('display', ev.detail.toString());
                setShown(true);
                return prev;
            });
        };

        document.addEventListener(HIDE, hideHandler);
        document.addEventListener(SHOW, showHandler);
        return () => {
            document.removeEventListener(HIDE, hideHandler);
            document.removeEventListener(SHOW, showHandler);
        };
    }, []);

    return (
        <Modal
            isOpen={shown}
            onDismiss={hideModal}
            forceFocusInsideTrap={false}
            isClickableOutsideFocusTrap
        >
            <div className={styles.modal}>
                <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    className={styles.closeButton}
                    onClick={hideModal}
                />
                <div className={`${styles.modalContent} scroll-bar`}>
                    {item && <ItemTemplate item={item} collapsible={false} />}
                </div>
            </div>
        </Modal>
    );
};
