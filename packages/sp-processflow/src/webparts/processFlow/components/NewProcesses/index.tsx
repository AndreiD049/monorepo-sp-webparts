import { IProcess } from '@service/process-flow';
import {
    IconButton,
    Position,
    SpinButton,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { MainService } from '../../services/main-service';
import { GlobalContext } from '../../utils/globalContext';
import styles from './NewProcesses.module.scss';

export interface INewProcessesProps {
    // Props go here
}

export const NewProcesses: React.FC<INewProcessesProps> = (props) => {
    const { ProcessService } = MainService;
    const { selectedFlow, selectedTeam } = React.useContext(GlobalContext);
    const [rows, setRows] = React.useState<{ [key: string]: string | number }[]>([{}]);
    const [categories, setCategories] = React.useState([]);
    const [systems, setSystems] = React.useState([]);
    const uom = React.useMemo(() => ['Order', 'Day', 'Week', 'Month'], []);

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

    const handlePaste = React.useCallback((idx: number, property: string) => (evt: React.ClipboardEvent<HTMLElement>) => {
        const data = evt.clipboardData.getData('text').split(/\r?\n/).filter((d) => Boolean(d));
        const maxIndex = idx + data.length;
        evt.preventDefault();
        setRows((prev: { [key: string]: string }[]) => {
            const copy = [...prev];
            for (let i = idx, d = 0; i < maxIndex; i++) {
                const element = prev[i];
                if (element) {
                    copy[i][property] = data[d];
                } else {
                    copy[i] = { [property]: data[d] }
                }
                d++;
            }
            return copy;
        });
    }, []);

    const handleUpdate = React.useCallback((idx: number, property: string) => (_ev: {}, newValue: string) => {
        setRows((prev) => {
            const copy = [...prev];
            copy[idx][property] = newValue;
            return copy;
        });
    }, []);

    const options = React.useMemo(
        () => (
            <>
                <datalist id="newProcessSystem">
                    {systems.map((system) => (
                        <option key={system}>{system}</option>
                    ))}
                </datalist>
                <datalist id="newProcessCategories">
                    {categories.map((category) => (
                        <option key={category}>{category}</option>
                    ))}
                </datalist>
                <datalist id="newProcessUOM">
                    {uom.map((unit) => (
                        <option key={unit}>{unit}</option>
                    ))}
                </datalist>
            </>
        ),
        [systems, categories, uom]
    );

    return (
        <div className={styles.container}>
            {rows.map((row, idx) => (
                <div
                    key={idx}
                    style={{
                        display: 'flex',
                        flexFlow: 'row nowrap',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: '.5em',
                    }}
                >
                    <TextField
                        label="Category"
                        styles={{ root: { maxWidth: 150 } }}
                        list="newProcessCategories"
                        onPaste={handlePaste(idx, 'Category')}
                        onChange={handleUpdate(idx, 'Category')}
                        value={rows[idx].Category?.toString()}
                        autoComplete="off"
                    />
                    <TextField
                        label="System"
                        autoComplete="off"
                        onPaste={handlePaste(idx, 'System')}
                        onChange={handleUpdate(idx, 'System')}
                        value={row.System?.toString()}
                        list="newProcessSystem"
                        styles={{ root: { maxWidth: 100 } }}
                    />
                    <TextField
                        label="Process"
                        autoComplete="off"
                        onPaste={handlePaste(idx, 'Process')}
                        onChange={handleUpdate(idx, 'Process')}
                        value={row.Process?.toString()}
                    />
                    <TextField
                        label="Allocation"
                        type='number'
                        onPaste={handlePaste(idx, 'Allocation')}
                        onChange={(ev, value) => setRows((prev) => {
                            const copy = [...prev];
                            const val = Number.isNaN(value) ? 0 : Number.parseInt(value);
                            copy[idx].Allocation = val;
                            return copy;
                        })}
                        value={rows[idx].Allocation?.toString()}
                        styles={{ root: { maxWidth: 100 } }}
                    />
                    <TextField
                        label="UOM"
                        list="newProcessUOM"
                        onPaste={handlePaste(idx, 'UOM')}
                        onChange={handleUpdate(idx, 'UOM')}
                        value={rows[idx].UOM?.toString()}
                        styles={{ root: { maxWidth: 100 } }}
                    />
                </div>
            ))}
            <IconButton
                onClick={handleAddNewRow}
                iconProps={{ iconName: 'Add' }}
            />
            {options}
        </div>
    );
};
