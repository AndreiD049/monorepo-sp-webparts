import { ITaskOverview } from "../ITaskOverview";
import { TaskNode } from "./TaskNode";

export function createTaskTree(tasks: ITaskOverview[]) {
    const roots: ITaskOverview[] = [];
    const taskMap: Map<number, TaskNode> = new Map();
    tasks.forEach((task) => {
        if (!task.ParentId) {
            roots.push(task);
        } else {
            taskMap.set(task.Id, new TaskNode(task));
        }
    });
    const rootNode = new TaskNode()
        .withChildren(roots);
    rootNode.getChildren().forEach((root) => {
        taskMap.set(root.getTask().Id, root);
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