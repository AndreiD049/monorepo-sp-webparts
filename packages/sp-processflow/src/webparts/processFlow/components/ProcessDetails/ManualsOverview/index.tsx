import { ActionButton, IconButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import {
    FooterYesNo,
    hideDialog,
    hideSpinner,
    showDialog,
    showSpinner,
} from 'sp-components';
import { MainService } from '../../../services/main-service';
import {
    LOADING_SPINNER_PANEL,
    MANUAL_SEPARATOR,
    PANEL_DIALOG,
} from '../../../utils/constants';
import { addManual, editManual } from '../../ManualDialog';
import { completeManualLink } from '../../ProcessFlowTable/ProcessCell';
import styles from './ManualsOverview.module.scss';

export interface IManualsOverviewProps {
    processId: number;
    manuals: string[][];
    onManualsChange: (newValue: string) => void;
}

export const ManualsOverview: React.FC<IManualsOverviewProps> = (props) => {
    const handleDelete = React.useCallback(
        (name: string, link: string) => async () => {
            try {
                hideDialog(PANEL_DIALOG);
                showSpinner(LOADING_SPINNER_PANEL);
                const { ProcessService } = MainService;
                const process = await ProcessService.getById(props.processId);
                const newManuals = process.Manual.split('\n')
                    .filter(
                        (line) => line !== `${name}${MANUAL_SEPARATOR}${link}`
                    )
                    .join('\n');
                await ProcessService.updateProcess(props.processId, {
                    Manual: newManuals.trim(),
                });
                props.onManualsChange(newManuals);
            } finally {
                hideSpinner(LOADING_SPINNER_PANEL);
            }
        },
        []
    );

    const body = React.useMemo(() => {
        return props.manuals.map((manual) => (
            <div key={manual[0]} className={styles.manualsRow}>
                <TextField value={manual[0]} readOnly />
                <TextField
                    value={manual[1]}
                    className={styles.manualsRowLink}
                    readOnly
                />
                <IconButton
                    iconProps={{ iconName: 'OpenInNewTab' }}
                    onClick={() =>
                        window.open(completeManualLink(manual[1]), '_blank', 'noreferrer,noopener')
                    }
                />
                <IconButton
                    iconProps={{ iconName: 'Edit' }}
                    onClick={async () => {
                        const newManuals = await editManual(
                            props.processId,
                            manual[0],
                            manual[1],
                            PANEL_DIALOG
                        );
                        props.onManualsChange(newManuals);
                    }}
                />
                <IconButton
                    iconProps={{ iconName: 'Delete' }}
                    onClick={() =>
                        showDialog({
                            id: PANEL_DIALOG,
                            dialogProps: {
                                dialogContentProps: {
                                    title: 'Delete',
                                    subText: 'Delete manual?',
                                },
                            },
                            footer: (
                                <FooterYesNo
                                    onYes={handleDelete(manual[0], manual[1])}
                                    onNo={() => hideDialog(PANEL_DIALOG)}
                                />
                            ),
                        })
                    }
                />
            </div>
        ));
    }, [props.manuals]);

    return (
        <div>
            <ActionButton
                iconProps={{ iconName: 'Add' }}
                onClick={async () => {
                    const newManuals = await addManual(
                        props.processId,
                        PANEL_DIALOG
                    );
                    props.onManualsChange(newManuals);
                }}
            >
                Add manual
            </ActionButton>
            <div className={styles.manuals}>{body}</div>
        </div>
    );
};
