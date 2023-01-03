import ITaskLog from "@service/sp-tasks/dist/models/ITaskLog";
import { DefaultButton, PrimaryButton, TextField } from "office-ui-fabric-react";
import * as React from "react"
import { closePanel, setPanelProperties } from "../../hooks/usePanel";
import { updateTaskLog } from "../../hooks/useTasks";
import GlobalContext from "../../utils/GlobalContext";

export interface IAddRemarkProps {
    taskId: number;
    date: Date;
    taskLogId?: number;
}

export const AddRemark: React.FC<IAddRemarkProps> = ({ taskId, taskLogId, date }) => {
    const { TaskLogsService, TaskService } = React.useContext(GlobalContext);
    const [remark, setRemark] = React.useState('');

    /** Set remark initial value */
    React.useEffect(() => {
        if (taskLogId) {
            TaskLogsService.getTaskLog(taskLogId).then((log: ITaskLog) => {
                setRemark(log.Remark);
            });
        }
    }, []);

    const handleSave = React.useCallback(async () => {
        if (remark !== '') {
            const remarkProp = {
                Remark: remark,
            };
            let createdLog;
            if (!taskLogId) {
                // Create task log first
                const task = await TaskService.getTask(taskId);
                createdLog = await TaskLogsService.createTaskLogFromTask(task, date, remarkProp)
            } else {
                createdLog = await TaskLogsService.updateTaskLog(taskLogId, remarkProp);
            }
            updateTaskLog(createdLog);
        }
        closePanel('SP_TASKS');
    }, [remark]);

    /**
     * Set panel properties
     */
    React.useEffect(() => {
        setPanelProperties('SP_TASKS', {
            isFooterAtBottom: true,
            onRenderFooterContent: () => (
                <>
                    <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
                    <DefaultButton
                        style={{ marginLeft: '.5em' }}
                        onClick={() => closePanel('SP_TASKS')}
                    >
                        Close
                    </DefaultButton>
                </>
            ),
        });
    }, [handleSave]);

    return (<div>
        <TextField
            styles={{
                root: {
                    marginTop: '1em'
                }
            }}
            multiline
            value={remark}
            resizable={false}
            autoAdjustHeight
            onChange={(_ev, newValue) => setRemark(newValue)}
        />
    </div>)
}
