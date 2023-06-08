import * as React from 'react';
import styles from './AppSettings.module.scss';
import {
    addApplication,
    editApplication,
    getApplications,
} from './applications';
import { IApplication } from './IApplication';
import { Icon } from 'office-ui-fabric-react';
import { SettingsService } from '../../services/settings-service';

export interface IAppSettingsProps {}

const ADD_DIALOG_OPEN = 'AddDialogOpen';
const EDIT_DIALOG_OPEN = 'EditDialogOpen';

const AddDialog: React.FC<{ onAdded: (app: IApplication) => void }> = (
    props
) => {
    const dialogRef = React.useRef(null);
    const [newApp, setNewApp] = React.useState<IApplication['Data']>({
        name: '',
        active: true,
        imageUrl: '',
    });

    const closeDialog = (): void => {
        if (!dialogRef.current) {
            return;
        }

        dialogRef.current.close();
    };

    React.useEffect(() => {
        const handler = (ev: CustomEvent): void => {
            if (!dialogRef.current) {
                return;
            }

            dialogRef.current.showModal();
        };

        document.addEventListener(ADD_DIALOG_OPEN, handler);

        return () => document.removeEventListener(ADD_DIALOG_OPEN, handler);
    }, []);

    const onAddApplication = async (ev: React.FormEvent): Promise<void> => {
        closeDialog();
        ev.preventDefault();

        const added = await addApplication(newApp);
        props.onAdded(added);
    };

    return (
        <dialog
            id="appAddDialog"
            onKeyDown={(evt) => evt.key === 'Escape' && closeDialog()}
            className={styles.addDialog}
            ref={dialogRef}
        >
            <h1>Add application</h1>
            <p>Application for the user to select</p>
            <form onSubmit={onAddApplication}>
                <label htmlFor="name">Name</label>
                <input
                    required
                    type="text"
                    value={newApp.name}
                    autoComplete="off"
                    onChange={(ev) => {
                        if (typeof ev.target.value === 'string') {
                            setNewApp((prev) => ({
                                ...prev,
                                name: ev.target.value,
                            }));
                        }
                    }}
                />

                <label htmlFor="imageUrl">Image URL</label>
                <input
                    type="text"
                    value={newApp.imageUrl}
                    autoComplete="off"
                    onChange={(ev) => {
                        if (typeof ev.target.value === 'string') {
                            setNewApp((prev) => ({
                                ...prev,
                                imageUrl: ev.target.value,
                            }));
                        }
                    }}
                />

                {newApp.imageUrl && <img src={newApp.imageUrl} alt="Preview" />}

                <button type="submit">Add</button>
            </form>
        </dialog>
    );
};

const EditDialog: React.FC<{
    onEdited: (app: IApplication) => void;
}> = (props) => {
    const dialogRef = React.useRef(null);
    const [app, setApp] = React.useState<IApplication>(null);

    const closeDialog = (): void => {
        if (!dialogRef.current) {
            return;
        }

        dialogRef.current.close();
    };

    const onSubmit = async (ev: React.FormEvent): Promise<void> => {
        closeDialog();
        ev.preventDefault();

        const edited = await editApplication(app.ID, app.Data);
        props.onEdited(edited);
    };

    React.useEffect(() => {
        const handler = (ev: CustomEvent<IApplication>): void => {
            if (!dialogRef.current) {
                return;
            }

            setApp(ev.detail);
            dialogRef.current.showModal();
        };

        document.addEventListener(EDIT_DIALOG_OPEN, handler);

        return () => document.removeEventListener(EDIT_DIALOG_OPEN, handler);
    }, []);

    return (
        <dialog
            id="appEditDialog"
            className={styles.addDialog}
            ref={dialogRef}
            onKeyDown={(ev) => ev.key === 'Escape' && closeDialog()}
        >
            <h1>Edit application</h1>
            <p>
                Warning: editing the application does not change existing
                feedbacks
            </p>
            <form onSubmit={onSubmit}>
                <label htmlFor="name">Name</label>
                <input
                    required
                    type="text"
                    autoComplete="off"
                    value={app?.Data.name}
                    onChange={(ev) => {
                        if (typeof ev.target.value === 'string') {
                            setApp((prev) => ({
                                ...prev,
                                Data: { ...prev.Data, name: ev.target.value },
                            }));
                        }
                    }}
                />

                <label htmlFor="imageUrl">Image URL</label>
                <input
                    type="text"
                    autoComplete="off"
                    value={app?.Data.imageUrl}
                    onChange={(ev) => {
                        if (typeof ev.target.value === 'string') {
                            setApp((prev) => ({
                                ...prev,
                                Data: {
                                    ...prev.Data,
                                    imageUrl: ev.target.value,
                                },
                            }));
                        }
                    }}
                />
                {app?.Data.imageUrl && (
                    <img src={app.Data.imageUrl} alt="Preview" />
                )}

                <button type="submit">Save</button>
            </form>
        </dialog>
    );
};

export const AppSettings: React.FC<IAppSettingsProps> = (props) => {
    const [search, setSearch] = React.useState('');
    const [apps, setApps] = React.useState<IApplication[]>([]);

    React.useEffect(() => {
        getApplications().then(
            (apps) => setApps(apps),
            (error) => console.error(error)
        );
    }, []);

    const showAddDialog = (): void => {
        const dialog: any = document.getElementById('appAddDialog');
        dialog.showModal();
    };

    const onDeleteSetting = async (id: number): Promise<void> => {
        if (confirm('Are you sure you want to delete this application?')) {
            await SettingsService.deleteSetting(id);
            setApps((prev) => prev.filter((app) => app.ID !== id));
        }
    };

    const foundApps = search
        ? apps.filter(
              (app) =>
                  app.Data.name.toLowerCase().indexOf(search.toLowerCase()) > -1
          )
        : apps;

    return (
        <div tabIndex={1}>
            <section className={styles.header}>
                <p className={styles.headerTitle}>
                    <Icon iconName="WebAppBuilderFragment" /> Applications
                </p>
                <p>
                    Applications that are available for feedback. Here you can
                    add, edit and remove applications.
                </p>
            </section>

            <div className={styles.toolbar}>
                <input
                    type="text"
                    placeholder="Search"
                    onChange={(ev) => setSearch(ev.target.value)}
                />
                <button onClick={showAddDialog}>Add</button>
            </div>

            <div>
                <table className={styles.table}>
                    <tbody>
                        {foundApps.map((app, idx) => (
                            <tr key={app.ID} tabIndex={1}>
                                <td>{idx + 1}.</td>
                                <td>
                                    <img
                                        width="50"
                                        src={app.Data.imageUrl}
                                        alt={app.Data.name}
                                    />
                                </td>
                                <td>{app.Data.name}</td>
                                <td className={styles.tableControlButtons}>
                                    <button
                                        onClick={() =>
                                            document.dispatchEvent(
                                                new CustomEvent<IApplication>(
                                                    EDIT_DIALOG_OPEN,
                                                    { detail: app }
                                                )
                                            )
                                        }
                                    >
                                        🔧 Edit
                                    </button>
                                    <button
                                        onClick={() => onDeleteSetting(app.ID)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddDialog onAdded={(app) => setApps((prev) => [...prev, app])} />

            <EditDialog
                onEdited={(app) =>
                    setApps((prev) =>
                        prev.map((p) => (p.ID === app.ID ? app : p))
                    )
                }
            />
        </div>
    );
};
