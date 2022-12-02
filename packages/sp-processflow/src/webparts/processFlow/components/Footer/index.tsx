import { Icon, Link, Separator, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { IProcessFlowConfig } from '../../IProcessFlowConfig';
import styles from './Footer.module.scss';

export interface IFooterProps {
    // Props go here
    config: IProcessFlowConfig;
}

export const Footer: React.FC<IFooterProps> = (props) => {
    return (
        <div className={styles.container}>
            <Separator styles={{ root: { width: '100%' } }} />
            <div>
                <Icon
                    styles={{ root: { marginRight: '.5em' } }}
                    iconName="MailForwardMirrored"
                />
                <Text variant="medium">
                    Any questions -{' '}
                    <Link href={`mailto:${props.config.contactEmail}?Subject=Sharepoint ProcessFlow Webpart question`}>
                        Contact us
                    </Link>
                </Text>
            </div>
        </div>
    );
};
