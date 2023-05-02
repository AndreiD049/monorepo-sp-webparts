import { IManualJson } from '@service/process-flow/dist/models';
import { ActionButton, Icon, IContextualMenuProps, PrimaryButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import {
	FooterYesNo,
	hideDialog,
	hideSpinner,
	showDialog,
	showSpinner,
} from 'sp-components';
import { MainService } from '../../../services/main-service';
import {
	LOADING_SPINNER_PANEL,
	PANEL_DIALOG,
} from '../../../utils/constants';
import { addManual, editManual } from '../../ManualDialog';
import styles from './ManualsOverview.module.scss';

export interface IManualsOverviewProps {
	processId: number;
	manuals: IManualJson[];
	onManualsChange: (newValue: string) => void;
}

function openManualLink(manual: IManualJson): void {
	window.open(manual.Link, '_blank', 'noreferrer,noopener');
}

export const ManualEntry: React.FC<{ processId: number, manual: IManualJson, onChange: IManualsOverviewProps['onManualsChange'] }> = (props) => {
	const info = `Name: ${props.manual.Name}\nFile name: ${props.manual.Filename}\nLink: ${props.manual.Link}\nPage: ${props.manual.Page}`;

	const handleDelete = React.useCallback(
		(name: string, link: string) => async () => {
			try {
				hideDialog(PANEL_DIALOG);
				showSpinner(LOADING_SPINNER_PANEL);
				const { ProcessService } = MainService;
				await ProcessService.deleteManual(props.processId, name, link);
				const updatedProcess = await ProcessService.getById(props.processId);
				props.onChange(updatedProcess.Manual);
			} finally {
				hideSpinner(LOADING_SPINNER_PANEL);
			}
		},
		[]
	);

	const menuProps: IContextualMenuProps = {
		items: [
			{
				key: 'edit',
				text: 'Edit',
				iconProps: { iconName: 'Edit' },
				onClick: () => {
					async function run(): Promise<void> {
						const newManuals = await editManual(
							props.processId,
							props.manual.Name,
							props.manual.Link,
							PANEL_DIALOG
						);
						props.onChange(newManuals);
					}
					run().catch(console.error);
				}
			},
			{
				key: 'delete',
				text: 'Delete',
				iconProps: { iconName: 'Delete' },
				onClick: () =>
					showDialog({
						id: PANEL_DIALOG,
						dialogProps: {
							dialogContentProps: {
								title: 'Delete',
								subText: 'Delete manual?',
							},
						},
						footer: (
							<FooterYesNo
								onYes={handleDelete(props.manual.Name, props.manual.Link)}
								onNo={() => hideDialog(PANEL_DIALOG)}
							/>
						),
					})
			},
		]
	}

	return (
		<tr key={props.manual.Id}>
			<td>
				<Icon
					className={styles.infoIcon}
					iconName='Info'
					title={info}
				/>
			</td>
			<td>
				<Text variant='mediumPlus'>{props.manual.Name}</Text>
			</td>
			<td>
				<PrimaryButton
					text='Open'
					split
					menuProps={menuProps}
					onClick={() => openManualLink(props.manual)}
				/>
			</td>
		</tr>
	);
}

export const ManualsOverview: React.FC<IManualsOverviewProps> = (props) => {

	const body = React.useMemo(() => {
		return props.manuals.map((manual) => (
			<ManualEntry key={manual.Name} processId={props.processId} manual={manual} onChange={props.onManualsChange} />
		));
	}, [props.manuals]);

	return (
		<div>
			<ActionButton
				iconProps={{ iconName: 'Add' }}
				onClick={async () => {
					const newManuals = await addManual(
						props.processId,
						PANEL_DIALOG
					);
					props.onManualsChange(newManuals);
				}}
			>
				Add manual
			</ActionButton>
			<table className={styles.manualsTable}>
				<tbody>
					{body}
				</tbody>
			</table>
		</div>
	);
};
