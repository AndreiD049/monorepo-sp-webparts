import { MessageBarType } from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import IAppraisalItem from '../../models/IAppraisalItem';
import ISectionProps from '../../models/ISectionProps';
import SourceService from '../../services/SourceService';
import styles from './AppraisalsSection.module.scss';

export interface IAppraisalsSectionProps extends ISectionProps {
    // Props go here
}

export const AppraisalsSection: React.FC<IAppraisalsSectionProps> = (props) => {
    const [data, setData] = React.useState<IAppraisalItem[]>([]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            const sectionService = new SourceService(props.section.sources[0]);
            setData(await sectionService.getSourceData());
        }
        run().catch(err => SPnotify(({
            message: err.message,
            messageType: MessageBarType.error,
        })));
    }, [props.section]);

    return (
        <div className={styles.container}>
            {
                data.map((appraisal) => (<div key={appraisal.Content}>[[{appraisal.ItemType}]] - {appraisal.Content}</div>))
            }
        </div>
    );
};
