import {
    DefaultButton,
    PrimaryButton,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { hideDialog, showDialog } from 'sp-components';
import { DIALOG_ID, SELECTED_VIEW } from '../../constants';
import { dispatchItemAdded, dispatchItemUpdated } from '../../services/events';
import {
    getEmptySelectedViewFields,
    makeViewItem,
    SelectedViewInfo,
} from '../../services/saved-view';
import styles from './SaveFilterDialog.module.scss';

export interface ISaveFilterDialogProps {
    filterInfo: SelectedViewInfo;
    onHide: () => void;
}

export const SaveFilterDialog: React.FC<ISaveFilterDialogProps> = (props) => {
    const [newFilterName, setNewFilterName] = React.useState(
        props.filterInfo.selectedTitle
    );
    const willOverwrite = React.useMemo(
        () => newFilterName === props.filterInfo.selectedTitle,
        [newFilterName, props.filterInfo]
    );

    const handleUpdateSelectedFilter = (filterName: string): void => {
        // If not overwriting, we also need to update the currently selected filter
        dispatchItemUpdated(
            SELECTED_VIEW,
            getEmptySelectedViewFields(filterName),
            { temp: true, persist: true }
        );
    }

    const handleSaveFilter = (): void => {
        const newSavedFilter = makeViewItem(
            newFilterName,
            props.filterInfo
        );
        // Create a new filter of overwrite the old one
        if (!willOverwrite) {
            dispatchItemAdded(newSavedFilter.asRaw(), null, () => handleUpdateSelectedFilter(newFilterName));
        } else {
            dispatchItemUpdated(props.filterInfo.selectedItem.Id, newSavedFilter.Fields, null, () => handleUpdateSelectedFilter(newFilterName));
        }
        props.onHide();
    };

    return (
        <div className={styles.container}>
            <TextField
                value={newFilterName}
                onChange={(_ev, value) => setNewFilterName(value)}
            />
            <span className={styles.warning}>
                {newFilterName === props.filterInfo.selectedTitle
                    ? 'Warning! Curent filter will be overwriten!'
                    : ' '}
            </span>
            <div className={styles.footer}>
                <PrimaryButton onClick={handleSaveFilter}>Save</PrimaryButton>
                <DefaultButton onClick={props.onHide}>Cancel</DefaultButton>
            </div>
        </div>
    );
};

export function showSaveFilterDialog(filterInfo: SelectedViewInfo): void {
    showDialog({
        id: DIALOG_ID,
        dialogProps: {
            dialogContentProps: { title: 'Save filter' },
            minWidth: 300,
        },
        content: (
            <SaveFilterDialog
                filterInfo={filterInfo}
                onHide={() => hideDialog(DIALOG_ID)}
            />
        ),
    });
}
