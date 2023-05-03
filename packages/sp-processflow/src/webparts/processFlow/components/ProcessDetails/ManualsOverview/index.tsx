import { getDocIcon } from '@service/process-flow';
import { IManualJson } from '@service/process-flow/dist/models';
import { ActionButton, DefaultButton, Icon, IContextualMenuProps, PanelType, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import {
	FooterYesNo,
	hideDialog,
	hideSpinner,
	Panel,
	showDialog,
	showPanel,
	showSpinner,
} from 'sp-components';
import { MainService } from '../../../services/main-service';
import {
	LOADING_SPINNER_PANEL,
	PANEL_DIALOG,
	PANEL_MANUALS_DETAILS,
} from '../../../utils/constants';
import { addManual, editManual } from '../../ManualDialog';
import { ManualPanelDetails } from '../../ManualPanelDetails';
import styles from './ManualsOverview.module.scss';

export interface IManualsOverviewProps {
	processId: number;
	manuals: IManualJson[];
	onManualsChange: (newValue: string) => void;
}

function openManualLink(manual: IManualJson): void {
	showPanel(
		PANEL_MANUALS_DETAILS,
		{
			headerText: manual.Name,
		},
		<ManualPanelDetails manual={manual} />
	);
}

export const ManualEntry: React.FC<{ processId: number, manual: IManualJson, onChange: IManualsOverviewProps['onManualsChange'], index: number }> = (props) => {
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
							PANEL_DIALOG,
							props.index,
							props.manual.Page || 1
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
					iconName={getDocIcon(props.manual.Filename)}
				/>
			</td>
			<td>
				<Text variant='mediumPlus'>{props.manual.Name}</Text>
			</td>
			<td>
				<Icon
					className={styles.infoIcon}
					iconName='Info'
					title={info}
				/>
			</td>
			<td>
				<DefaultButton
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
		return props.manuals.map((manual, idx) => (
			<ManualEntry key={manual.Name} processId={props.processId} manual={manual} onChange={props.onManualsChange} index={idx} />
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
			<Panel
				id={PANEL_MANUALS_DETAILS}
				defaultProps={{
					type: PanelType.customNear,
					customWidth: '70vw',
				}}
			/>
		</div>
	);
};
