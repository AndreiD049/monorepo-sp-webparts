import { IProcess } from '@service/process-flow';
import {
    ActionButton,
    IconButton,
    MessageBarType,
    TextField,
} from '@fluentui/react';
import * as React from 'react';
import { hidePanel, hideSpinner, showSpinner } from 'sp-components';
import { IItemAddResult } from 'sp-preset';
import { SPnotify } from 'sp-react-notifications';
import { MainService } from '../../services/main-service';
import { LOADING_SPINNER, MAIN_PANEL, MAIN_PANEL_FORM } from '../../utils/constants';
import { processAdded } from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';
import { CategoryTextField, SystemTextField, UomTextField } from '../TextFields';
import styles from './NewProcesses.module.scss';

export interface INewProcessesProps {
    // Props go here
}

interface INewProcessRowProps {
    idx: number;
    onPaste: (
        idx: number,
        property: keyof IProcess,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        convert?: (val: string) => any
    ) => React.ClipboardEventHandler<HTMLElement>;
    onUpdate: (
        idx: number,
        property: keyof IProcess
    ) => (
        event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ) => void;
    rows: Partial<IProcess>[];
    row: Partial<IProcess>;
    setRows: React.Dispatch<React.SetStateAction<Partial<IProcess>[]>>;
    systems: string[];
    categories: string[];
}

export const NewProcessRow: React.FC<INewProcessRowProps> = (props) => {
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: '.5em',
            }}
        >
            <CategoryTextField
                key="newProcessCategories"
                required
                label="Category"
                styles={{ root: { maxWidth: 150 } }}
                list="newProcessCategories"
                onPaste={props.onPaste(props.idx, 'Category')}
                onChange={props.onUpdate(props.idx, 'Category')}
                value={props.rows[props.idx].Category?.toString()}
                autoComplete="off"
                options={props.categories}
            />
            <SystemTextField
                key="newSystemCategories"
                required
                label="System"
                autoComplete="off"
                onPaste={props.onPaste(props.idx, 'System')}
                onChange={props.onUpdate(props.idx, 'System')}
                value={props.row.System?.toString()}
                styles={{ root: { maxWidth: 100 } }}
                options={props.systems}
            />
            <TextField
                required
                label="Process"
                autoComplete="off"
                styles={{ root: { flexGrow: 2, maxWidth: 400 } }}
                onPaste={props.onPaste(props.idx, 'Title')}
                onChange={props.onUpdate(props.idx, 'Title')}
                value={props.row.Title?.toString()}
            />
            <TextField
                label="Allocation"
                type="number"
                autoComplete="off"
                onPaste={props.onPaste(props.idx, 'Allocation', (val) => Number.parseInt(val))}
                onChange={(ev, value) =>
                    props.setRows((prev) => {
                        const copy = [...prev];
                        const val = Number.isNaN(value)
                            ? 0
                            : Number.parseInt(value);
                        copy[props.idx].Allocation = val;
                        return copy;
                    })
                }
                value={props.rows[props.idx].Allocation?.toString()}
                styles={{ root: { maxWidth: 100 } }}
            />
            <UomTextField
                key="uomTextField"
                label="UOM"
                autoComplete="off"
                list="newProcessUOM"
                onPaste={props.onPaste(props.idx, 'UOM')}
                onChange={props.onUpdate(props.idx, 'UOM')}
                value={props.rows[props.idx].UOM?.toString()}
                styles={{ root: { maxWidth: 100 } }}
            />
            <IconButton
                styles={{ root: { alignSelf: 'flex-end' } }}
                iconProps={{ iconName: 'Delete' }}
                onClick={() =>
                    props.setRows((prev) =>
                        prev.filter((_p, idx) => idx !== props.idx)
                    )
                }
            />
        </div>
    );
};

export const NewProcesses: React.FC<INewProcessesProps> = (props) => {
    const { ProcessService } = MainService;
    const { selectedFlow, selectedTeam } = React.useContext(GlobalContext);
    const [rows, setRows] = React.useState<Partial<IProcess>[]>([{}]);
    const [categories, setCategories] = React.useState([]);
    const [systems, setSystems] = React.useState([]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setCategories(await ProcessService.getCategoryOptions());
            setSystems(await ProcessService.getSystemChoices());
        }
        run().catch((err) => console.error(err));
    }, []);

    const handleAddNewRow = React.useCallback(
        () => setRows((prev) => [...prev, {}]),
        []
    );

    const handlePaste = React.useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (idx: number, property: keyof IProcess, convert?: (val: string) => any) =>
            (evt: React.ClipboardEvent<HTMLElement>) => {
                const data = evt.clipboardData.getData('text').split(/\r?\n/);
                const maxIndex = idx + data.length;
                evt.preventDefault();
                setRows((prev: { [key: string]: string }[]) => {
                    const copy = [...prev];
                    for (let i = idx, d = 0; i < maxIndex; i++) {
                        const element = prev[i];
                        const value = convert ? convert(data[d]) : data[d];
                        if (element) {
                            copy[i][property] = value;
                        } else {
                            copy[i] = { [property]: value };
                        }
                        d++;
                    }
                    return copy;
                });
            },
        []
    );

    const handleUpdate = React.useCallback(
        (idx: number, property: keyof IProcess) =>
            (_ev: {}, newValue: string) => {
                setRows((prev) => {
                    const copy = [...prev];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const process = copy[idx] as any;
                    process[property] = newValue;
                    return copy;
                });
            },
        []
    );

    const handleSubmit = React.useCallback(async (evt: React.FormEvent) => {
        try {
            hidePanel(MAIN_PANEL);
            showSpinner(LOADING_SPINNER);
            evt.preventDefault();
            const newProcesses: Omit<IProcess, 'Id'>[] = rows.map((row) => ({
                FlowId: selectedFlow.Id,
                Category: row.Category,
                Title: row.Title,
                System: row.System,
                Allocation: row.Allocation,
                Manual: row.Manual,
                Team: selectedTeam,
                UOM: row.UOM,
				OrderIndex: null,
            }));
            const newItems: IItemAddResult[] = await ProcessService.addProcesses(newProcesses);
            newItems.forEach((i) => processAdded(i.data.Id));
        } catch (err) {
            SPnotify({
                message: err,
                messageType: MessageBarType.error,
            });
        } finally {
            hideSpinner(LOADING_SPINNER);
        }
    }, [rows, selectedTeam]);

    return (
        <form className={styles.container} id={MAIN_PANEL_FORM} onSubmit={handleSubmit}>
            {rows.map((row, idx) => (
                <NewProcessRow
                    key={idx}
                    idx={idx}
                    rows={rows}
                    row={row}
                    onPaste={handlePaste}
                    onUpdate={handleUpdate}
                    setRows={setRows}
                    systems={systems}
                    categories={categories}
                />
            ))}
            <ActionButton
                styles={{ root: { marginTop: '.5em' } }}
                onClick={handleAddNewRow}
                iconProps={{ iconName: 'Add' }}
            >
                Add line
            </ActionButton>
        </form>
    );
};
