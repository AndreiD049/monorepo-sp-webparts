import { Panel, PanelType } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IFileInfo } from 'sp-preset';
import MainService from '../../services/main-service';
import styles from './NotesPanel.module.scss';

export interface INotesPanelProps {
    // Props go here
}

export const NotesPanel: React.FC<INotesPanelProps> = (props) => {
	const params = useParams();
	const taskId = +params.taskId;
	const navigate = useNavigate();
	const [file, setFile] = React.useState<IFileInfo | null>(null);
	React.useEffect(() => {
		async function run(): Promise<void> {
			const taskService = MainService.getTaskService();
			const NotesSection =
				await taskService.getNoteSectionName(taskId);
			const NoteService = MainService.getNoteService();
			const path = await NoteService.getSection(NotesSection);
			setFile(path);
		}
		run().catch(err => console.error(err));
	}, []);
	
    return (
		<Panel
			isOpen
			isLightDismiss
			onDismiss={() => navigate('/')}
			headerText="Notes"
			type={PanelType.customNear}
			customWidth="95vw"
		>
			{file && (
				<iframe
					className={styles.frame}
					src={file.LinkingUri}
				/>
			)}
		</Panel>
    );
};
