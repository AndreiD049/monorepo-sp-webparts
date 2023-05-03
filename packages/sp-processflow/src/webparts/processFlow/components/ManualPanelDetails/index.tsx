import { getDocIcon } from '@service/process-flow';
import { IManualJson } from '@service/process-flow/dist/models';
import { ActionButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { MainService } from '../../services/main-service';
import styles from './ManualPanelDetails.module.scss';

export interface IManualPanelDetailsProps {
	manual: IManualJson;
}

export const ManualPanelDetails: React.FC<IManualPanelDetailsProps> = (props) => {
	const { ProcessService } = MainService;
	return (
		<div className={styles.container}>
			<div className={styles.openButtons}>
				<ActionButton
					iconProps={{ iconName: 'OpenInNewTab' }}
					text="Open in browser"
					onClick={() => window.open(props.manual.Link, '_blank', 'noreferrer,noopener')}
				/>
				{
					props.manual.DesktopLink &&
					<ActionButton
						iconProps={{ iconName: getDocIcon(props.manual.Filename || '') }}
						text="Open in Desktop app"
						onClick={() => window.open(props.manual.DesktopLink, '_blank', 'noreferrer,noopener')}
					/>
				}
			</div>
			<div>
				<iframe 
					src={ProcessService.getManualLink(props.manual, "embed")} 
					width="100%" 
					style={{ height: '85vh' }}
				/>
			</div>
		</div>
	);
};
