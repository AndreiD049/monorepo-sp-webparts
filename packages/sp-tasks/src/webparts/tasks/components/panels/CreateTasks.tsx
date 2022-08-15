import { ActionButton, DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { closePanel, setPanelProperties } from '../../hooks/usePanel';
import ITask from '../../models/ITask';

interface ICreateTaskWrapper {
    task: Partial<ITask>;
    complete: boolean;
}

export const CreateTasks: React.FC = () => {
    const [createdTasks, setCreatedTasks] = React.useState<ICreateTaskWrapper[]>([]);

    const handleAddNewTask = () => {
        setCreatedTasks((prev) => [
            ...prev,
            {
                task: {},
                complete: false,
            },
        ]);
    };

    const tasks = createdTasks.map((task) => <div>Task</div>);

    /**
     * Set panel properties
     */
    React.useEffect(() => {
        setPanelProperties('SP_TASKS', {
            isFooterAtBottom: true,
            onRenderFooterContent: (_props) => (
                <>
                    <PrimaryButton onClick={() => alert("SAVE")}>Save</PrimaryButton>
                    <DefaultButton
                        style={{ marginLeft: '.5em' }}
                        onClick={() => closePanel('SP_TASKS')}
                    >
                        Close
                    </DefaultButton>
                </>
            ),
        });
    }, []);

    return (
        <div>
            {tasks}
            <ActionButton onClick={handleAddNewTask} iconProps={{ iconName: 'Add' }}>Add task</ActionButton>
        </div>
    );
};
