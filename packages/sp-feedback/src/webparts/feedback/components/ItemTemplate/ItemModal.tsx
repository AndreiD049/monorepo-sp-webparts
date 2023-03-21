import { isNumber } from 'lodash';
import { Modal } from 'office-ui-fabric-react';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ItemTemplate } from '.';
import { $eq } from '../../indexes/filter';
import { GlobalContext } from '../Feedback';

const HIDE = 'spfxFeedbackHideModal';
const SHOW = 'spfxFeedbackShowModal';

export function showModal(id: number) {
    document.dispatchEvent(new CustomEvent<number>(SHOW, { detail: id }));
}

export function hideModal() {
    document.dispatchEvent(new CustomEvent(HIDE));
}

export const ItemModal: React.FC<{ id: number }> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const item = React.useMemo(
        () => indexManager.filterFirst($eq('id', props.id.toString())),
        [props.id]
    );

    if (!isNumber(props.id)) {
        return null;
    }

    return (
        <Modal isOpen onDismiss={() => hideModal()} forceFocusInsideTrap={false}>
            <ItemTemplate item={item} />
        </Modal>
    );
};

export const useItemModal = (): JSX.Element => {
    const [search, setSearchParams] = useSearchParams();
    const display = search.get('display');

    React.useEffect(() => {
        const hideHandler = (): void => {
            setSearchParams((prev) => {
                prev.delete('display');
                return prev;
            });
        };
        const showHandler = (ev: CustomEvent<number>): void => {
            if (!isNumber(ev.detail)) return null;
            setSearchParams((prev) => {
                prev.set('display', ev.detail.toString());
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

    if (!display) {
        return null;
    }

    return <ItemModal id={+display} />;
};
