import { ITaskOverview } from "../ITaskOverview";
import { TaskNode } from "./TaskNode";

export function createTaskTree(tasks: ITaskOverview[]) {
    const roots: ITaskOverview[] = [];
    const taskMap: Map<number, TaskNode> = new Map();
    const rootNode = new TaskNode();
    tasks.forEach((task) => {
        if (!task.ParentId) {
            roots.push(task);
            const node = new TaskNode(task);
            rootNode.setChild(node);
            taskMap.set(task.Id, node);
        } else {
            taskMap.set(task.Id, new TaskNode(task));
        }
    });
    // Distribute the subtasks
    tasks.forEach((subtask) => {
        if (taskMap.has(subtask.ParentId)) {
            taskMap.get(subtask.ParentId)
                .setChild(taskMap.get(subtask.Id));
        }
    });
    return rootNode;
}
