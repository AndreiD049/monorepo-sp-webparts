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

const AddDialog: React.FC<{ onAdded: (app: IApplication) => void }> = (
    props
) => {
    const [imgUrl, setImgUrl] = React.useState('');

    const closeDialog = (): void => {
        const dialog = document.getElementById('appAddDialog') as any;
        dialog.close();
    };

    const onAddApplication = async (ev: React.FormEvent): Promise<void> => {
        closeDialog();
        ev.preventDefault();

        const nameEl = document.getElementById('name') as HTMLInputElement;
        const name = nameEl.value;
        nameEl.value = '';

        const imageUrlEl = document.getElementById(
            'imageUrl'
        ) as HTMLInputElement;
        const imageUrl = imageUrlEl.value;
        imageUrlEl.value = '';

        setImgUrl('');

        const added = await addApplication({ name, imageUrl, active: true });
        props.onAdded(added);
    };

    return (
        <dialog
            id="appAddDialog"
            onKeyDown={(evt) => evt.key === 'Escape' && closeDialog()}
            className={styles.addDialog}
        >
            <h1>Add application</h1>
            <p>Application for the user to select</p>
            <form onSubmit={onAddApplication}>
                <label htmlFor="name">Name</label>
                <input required type="text" name="name" id="name" />
                <label htmlFor="imageUrl">Image URL</label>
                <input
                    type="text"
                    name="imageUrl"
                    id="imageUrl"
                    onChange={(evt) => setImgUrl(evt.target.value)}
                />
                {imgUrl && <img src={imgUrl} alt="Preview" />}
                <button type="submit">Add</button>
            </form>
        </dialog>
    );
};

const EditDialog: React.FC<{
    onEdited: (app: IApplication) => void;
}> = (props) => {
    const nameEl = React.useRef<HTMLInputElement>(null);
    const imageUrlEl = React.useRef<HTMLInputElement>(null);
    const [app, setApp] = React.useState(null);
    const [imgUrl, setImgUrl] = React.useState('');

    const closeDialog = (): void => {
        const dialog = document.getElementById('appEditDialog') as any;
        dialog.close();
    };

    const showDialog = (): void => {
        const dialog = document.getElementById('appEditDialog') as any;
        dialog.showModal();
    };

    const onSubmit = async (ev: React.FormEvent): Promise<void> => {
        closeDialog();
        ev.preventDefault();
        const name = nameEl.current.value;
        const imageUrl = imageUrlEl.current.value;
        const edited = await editApplication(app.ID, {
            name,
            imageUrl,
            active: true,
        });
        props.onEdited(edited);
    };

    React.useEffect(() => {
        const handler = (ev: CustomEvent<IApplication>): void => {
            setApp(ev.detail);
            setImgUrl(ev.detail.Data.imageUrl);
            nameEl.current.value = ev.detail.Data.name;
            imageUrlEl.current.value = ev.detail.Data.imageUrl;
            showDialog();
        };
        document.addEventListener('showEditDialog', handler);
        return () => document.removeEventListener('showEditDialog', handler);
    }, []);

    return (
        <dialog
            id="appEditDialog"
            className={styles.addDialog}
            onKeyDown={(ev) => ev.key === 'Escape' && closeDialog()}
        >
            <h1>Edit application</h1>
            <p>Warning: editing the application does not change existing feedbacks</p>
            <form onSubmit={onSubmit}>
                <label htmlFor="name">Name</label>
                <input
                    ref={nameEl}
                    required
                    type="text"
                    name="name"
                    id="name"
                />
                <label htmlFor="imageUrl">Image URL</label>
                <input
                    ref={imageUrlEl}
                    type="text"
                    name="imageUrl"
                    id="imageUrl"
                    onChange={(ev) => setImgUrl(ev.target.value)}
                />
                {imgUrl && (
                    <img src={imgUrl} alt="Preview" />
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
        ? apps.filter((app) =>
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
                                                    'showEditDialog',
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
