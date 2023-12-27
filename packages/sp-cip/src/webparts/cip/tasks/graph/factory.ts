import { ITaskOverview } from "@service/sp-cip/dist/models/ITaskOverview";
import { TaskNode } from "./TaskNode";

export function createTaskTree(tasks: ITaskOverview[]): TaskNode {
    const taskMap: Map<number, TaskNode> = new Map();
    const rootNode = new TaskNode();
    tasks.forEach((task) => {
        if (!task.ParentId) {
            const node = new TaskNode(task);
            rootNode.setChild(node);
            taskMap.set(task.Id, node);
        } else {
            taskMap.set(task.Id, new TaskNode(task));
        }
    });
    // Distribute the subtasks
    tasks.forEach((subtask) => {
        const subtaskNode = taskMap.get(subtask.Id);
        if (taskMap.has(subtask.ParentId)) {
            taskMap.get(subtask.ParentId).setChild(subtaskNode);
        } else if (!taskMap.has(subtask.MainTaskId)) {
            // there is no direct parent in the Map
            // just append the task to root
            subtaskNode.isOrphan = true;
            rootNode.setChild(subtaskNode);
        }
    });
    return rootNode;
}
