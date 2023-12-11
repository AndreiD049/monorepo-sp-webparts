import {
	CommandBar,
	ICommandBarItemProps,
	Panel,
	PanelType,
	Pivot,
	PivotItem,
	Stack,
	StackItem,
	TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ActionLog } from '../../actionlog/ActionLog';
import { Comments } from '../../comments/Comments';
import {
	LoadingAnimation,
	loadingStart,
	loadingStop,
} from '../../components/utils/LoadingAnimation';
import { taskUpdated, taskUpdatedHandler } from '../../utils/dom-events';
import styles from './Panels.module.scss';
import MainService from '../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { AttachmentSection } from '../../components/AttachmentSection';
import { RelativeTasks } from '../../components/RelativeTasks';
import { Callout, Dialog, showDialog } from 'sp-components';
import { CALLOUT_ID_PANEL, DIALOG_ID_PANEL } from '../../utils/constants';
import { TimeLog } from '../../components/TimeLog';
import ResponsibleCell from '../cells/ResponsibleCell';

export const TaskDetails: React.FC = () => {
	const params = useParams();
	const [open, setOpen] = React.useState(true);
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const state = location.state as { editable: boolean };
	const [task, setTask] = React.useState<ITaskOverview>(null);
	const taskService = MainService.getTaskService();
	const [editable, setEditable] = React.useState(Boolean(state?.editable));
	const [editData, setEditData] = React.useState({
		title: task?.Title,
		description: task?.Description,
	});

	React.useEffect(() => {
		async function run(): Promise<void> {
			// if we have a task already, just skip it
			try {
				if (task) return null;
				loadingStart('details');
				const id = +params.taskId;
				if (Number.isInteger(id)) {
					const task = await taskService.getTask(id);
					setTask(task);
				}
			} finally {
				loadingStop('details');
			}
		}
		run().catch((e) => console.error(e));
	}, [params]);

	React.useEffect(() => {
		setEditData({
			title: task?.Title,
			description: task?.Description,
		});
	}, [task]);

	React.useEffect(() => {
		const removeHandler = taskUpdatedHandler((task) => setTask(task));
		return () => removeHandler();
	}, []);

	const editableInformation = !editable ? (
		<StackItem style={{ width: '100%' }}>
			<TextField
				label="Title"
				value={editData.title}
				borderless
				readOnly
			/>
			<TextField
				label="Description"
				value={editData.description}
				readOnly
				borderless
				multiline
				resizable={false}
				autoAdjustHeight
				placeholder="-"
			/>
		</StackItem>
	) : (
		<StackItem>
			<TextField
				label="Title"
				value={editData.title}
				onChange={(_evt, value) =>
					setEditData((prev) => ({
						...prev,
						title: value,
					}))
				}
			/>
			<TextField
				label="Description"
				value={editData.description}
				multiline
				resizable={false}
				autoAdjustHeight
				placeholder="-"
				onChange={(_evt, value) =>
					setEditData((prev) => ({
						...prev,
						description: value,
					}))
				}
			/>
		</StackItem>
	);

	const commandItems = React.useMemo<ICommandBarItemProps[]>(() => {
		const items = [];
		items.push({
			key: 'notes',
			text: 'Notes',
			iconProps: {
				iconName: 'OneNoteLogo16'
			},
			onClick: () => {
				const id = task.MainTaskId || task.Id;
				navigate(`/notes/${id}?from=${location.pathname}`);
			}
		});
		if (!editable) {
			items.push({
				key: 'edit',
				text: 'Edit',
				iconProps: {
					iconName: 'Edit',
				},
				onClick: () => setEditable(true),
			});
		} else {
			items.push({
				key: 'save',
				text: 'Save',
				iconProps: {
					iconName: 'Save',
				},
				onClick: async () => {
					await taskService.updateTask(task.Id, {
						Title: editData.title,
						Description: editData.description,
					});
					taskUpdated(await taskService.getTask(task.Id));
					setEditable(false);
				},
			});
			items.push({
				key: 'cancel',
				text: 'Cancel',
				iconProps: {
					iconName: 'ChromeClose',
				},
				onClick: () => {
					setEditData({
						title: task.Title,
						description: task.Description,
					});
					setEditable(false);
				},
			});
		}
		items.push({
			key: 'time',
			text: 'Log time',
			iconProps: {
				iconName: 'Clock',
			},
			onClick: () =>
				showDialog({
					id: DIALOG_ID_PANEL,
					dialogProps: {
						title: 'Log time',
					},
					content: <TimeLog task={task} dialogId={DIALOG_ID_PANEL} />,
				}),
		});
		return items;
	}, [editable, editData]);

	const farItems = [
		{
			key: 'responsible',
			text: 'Responsible',
			onRender: () =>
				task ? (
					<ResponsibleCell
						task={task}
						disabled={task.FinishDate ? true : false}
						calloutId={CALLOUT_ID_PANEL}
						loadingId="details"
					/>
				) : null,
		},
	];

	const handleDismiss = React.useCallback(() => {
		try {
			setTask(null);
			setOpen(false);
		} finally {
			setTimeout(() => {
				navigate('/');
				setOpen(true);
			}, 200);
		}
	}, []);

	return (
		<Panel
			isLightDismiss
			isFooterAtBottom
			headerText="Task details"
			type={PanelType.medium}
			isOpen={open}
			onDismiss={handleDismiss}
		>
			<div className={styles['details-panel']}>
				<CommandBar
					styles={{
						root: {
							paddingLeft: 0,
							height: '2em',
							marginBottom: '1em',
						},
					}}
					items={commandItems}
					farItems={farItems}
				/>
				{task && (
					<Stack>
						{editableInformation}
						<StackItem>
							<RelativeTasks
								task={task}
								onDismiss={handleDismiss}
							/>
						</StackItem>
						<StackItem>
							<AttachmentSection task={task} />
						</StackItem>
						<StackItem style={{ marginTop: '1em' }}>
							<Pivot
								selectedKey={
									searchParams.get('tab') || 'general'
								}
								onLinkClick={(item) =>
									setSearchParams({ tab: item.props.itemKey })
								}
							>
								<PivotItem
									headerText="General"
									itemKey="general"
								>
									<Comments task={task} />
								</PivotItem>
								<PivotItem
									headerText="Action log"
									itemKey="actionlog"
								>
									<ActionLog task={task} />
								</PivotItem>
							</Pivot>
						</StackItem>
					</Stack>
				)}
			</div>
			<Dialog id={DIALOG_ID_PANEL} />
			<Callout id={CALLOUT_ID_PANEL} />
			<LoadingAnimation elementId="details" initialOpen />
		</Panel>
	);
};
