import * as React from 'react';
import styles from './AppSettings.module.scss';
import { getApplications } from './applications';
import { IApplication } from './IApplication';
import { Icon } from 'office-ui-fabric-react';

export interface IAppSettingsProps {}

export const AppSettings: React.FC<IAppSettingsProps> = (props) => {
    const dialogRef = React.useRef(null);
    const [apps, setApps] = React.useState<IApplication[]>([]);

    React.useEffect(() => {
        getApplications().then(
            (apps) => setApps(apps),
            (error) => console.error(error)
        );
    }, []);

    return (
        <div tabIndex={1}>
            <section className={styles.header}>
                <p className={styles.headerTitle}>
                    <Icon iconName="WebAppBuilderFragment" /> Applications
                </p>
                <p>
                    Applications that are available for feedback. Here you can add, edit and remove applications.
                </p>
            </section>
            <div className={styles.toolbar}>
                <input type="text" placeholder="Search" />
                <button>Add</button>
            </div>

            <div>
                <table>
                    <tbody>
                        {apps.map((app, idx) => (
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
                                <td>
                                    <button onClick={() => dialogRef.current.showModal()}>🔧 Edit</button>
                                    <button>🗑️ Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
