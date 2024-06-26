import {
    DefaultButton,
    MessageBar,
    MessageBarType,
    PrimaryButton,
    TextField,
} from '@fluentui/react';
import * as React from 'react';
import { hideDialog, hideSpinner, showDialog, showSpinner } from 'sp-components';
import { MainService } from '../../services/main-service';
import { LOADING_SPINNER_PANEL, MAIN_DIALOG } from '../../utils/constants';
import styles from './ManualDialog.module.scss';

export interface IManualDialogProps {
    dialogId: string;
    operation: 'edit' | 'add';
    name?: string;
    link?: string;
	page?: number;
    onDone: (name: string, link: string, page: number) => void;
}

export const ManualDialog: React.FC<IManualDialogProps> = (props) => {
    const [error, setError] = React.useState('');
    const [name, setName] = React.useState(props.name || '');
    const [link, setLink] = React.useState(props.link || '');
    const [page, setPage] = React.useState(props.page || 1);

    const okText = React.useMemo(() => {
        switch (props.operation) {
            case 'add':
                return 'Add';
            case 'edit':
                return 'Save';
            default:
                throw Error('Unknown operation');
        }
    }, [props.operation]);

    const handlePressOk: React.FormEventHandler = React.useCallback((ev) => {
        ev.preventDefault();
        if (name.trim() === '' || link.trim() === '') {
            setError('Blank values not allowed');
            return;
        }
        props.onDone(name, link, page);
        hideDialog(props.dialogId);
    }, [name, link, page]);

	const validatePage = (val: string): number => {
		if (val === '') return 0;
		const num = Number.parseInt(val);
		if (isNaN(num) || num < 1) {
			return 1;
		}
		return num;
	}

    return (
        <form className={styles.container} onSubmit={handlePressOk}>
            {error !== '' && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
            <TextField
                label="Name"
                required
                value={name}
                onChange={(_ev, value) => setName(value)}
            />
            <TextField
                label="Link"
                required
                value={link}
                onChange={(_ev, value) => setLink(value)}
            />
			<TextField 
                label="Open on page"
				onChange={(_ev, newValue) => setPage(validatePage(newValue))}
				type="number"
				value={page === 0 ? '' : page.toString()}
				min={1}
			/>
            <div className={styles.footer}>
                <PrimaryButton type='submit'>{okText}</PrimaryButton>
                <DefaultButton onClick={() => hideDialog(props.dialogId)}>
                    Cancel
                </DefaultButton>
            </div>
        </form>
    );
};

export async function addManual(
    processId: number,
    dialogId: string = MAIN_DIALOG
): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            showDialog({
                id: dialogId,
                dialogProps: {
                    dialogContentProps: {
                        title: 'Add manual',
                    },
                    modalProps: {
                        isBlocking: true,
                    },
                },
                content: (
                    <ManualDialog
                        dialogId={dialogId}
                        operation="add"
                        onDone={async (name, link, page) => {
                            try {
                                showSpinner(LOADING_SPINNER_PANEL);
                                const { ProcessService } = MainService;
								await ProcessService.addManual(processId, link, name, page);
								const newProcess = await ProcessService.getById(processId);
                                resolve(newProcess.Manual);
                            } finally {
                                hideSpinner(LOADING_SPINNER_PANEL);
                            }
                        }}
                    />
                ),
            });
        } catch (err) {
            reject(err);
        }
    });
}

export async function editManual(
    processId: number,
    name: string,
    link: string,
    dialogId: string = MAIN_DIALOG,
	index: number,
	page: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            showDialog({
                id: dialogId,
                dialogProps: {
                    dialogContentProps: {
                        title: 'Edit manual',
                    },
                    modalProps: {
                        isBlocking: true,
                    },
                },
                content: (
                    <ManualDialog
                        dialogId={dialogId}
                        operation="edit"
                        name={name}
                        link={link}
						page={page}
                        onDone={async (newName, newLink, page) => {
                            try {
                                showSpinner(LOADING_SPINNER_PANEL);
								const { ProcessService } = MainService;
								await ProcessService.editManual(processId, index, newLink, newName, page);
								const updatedProcess = await ProcessService.getById(processId);
                                resolve(updatedProcess.Manual);
                            } finally {
                                hideSpinner(LOADING_SPINNER_PANEL);
                            }
                        }}
                    />
                ),
            });
        } catch (err) {
            reject(err);
        }
    });
}
