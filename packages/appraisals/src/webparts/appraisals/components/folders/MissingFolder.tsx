import { ActionButton, Persona } from 'office-ui-fabric-react';
import * as React from 'react';
import { ISiteUserInfo } from 'sp-preset';
import ManageFolderService from './folder-service';
import styles from './Folders.module.scss';

export interface IMissingFolderProps
    extends React.HTMLAttributes<HTMLDivElement> {
    user: ISiteUserInfo;
    service: ManageFolderService;
    handleFolderCreated: (id: number) => void;
}

const MissingFolder: React.FC<IMissingFolderProps> = (props) => {
    const [loading, setLoading] = React.useState(false);

    const handleFolderCreate = async () => {
        setLoading(true);
        const id = await props.service.createUserFolder(props.user.Title);
        await props.handleFolderCreated(id);
    }

    return (
        <div className={styles.missingFolder}>
            <Persona
                imageUrl={`/_layouts/15/userphoto.aspx?size=S&username=${props.user.Email}`}
                text={props.user.Title}
                onRenderSecondaryText={() => {
                    return (
                        <div>
                            <ActionButton
                                onClick={handleFolderCreate}
                                disabled={loading}
                                style={{
                                    fontSize: '1em',
                                    height: '20px',
                                }}
                                text="Create"
                                iconProps={{ 
                                    iconName: 'Add',
                                    style: {
                                        fontSize: '1em'
                                    }
                                }}
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default MissingFolder;
