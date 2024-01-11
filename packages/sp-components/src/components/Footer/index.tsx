import { Icon, Link, Separator, Text } from '@fluentui/react';
import * as React from 'react';
import styles from './Footer.module.scss';

export interface IFooterProps {
    // Props go here
    email: string;
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
                    <Link href={`mailto:${props.email}?Subject=Sharepoint ProcessFlow Webpart question`}>
                        Contact us
                    </Link>
                </Text>
            </div>
        </div>
    );
};
