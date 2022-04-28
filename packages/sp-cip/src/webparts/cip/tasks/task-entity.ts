import ITask from "./ITask";

export default class TaskEntity {
    private task: ITask;
    private parent?: TaskEntity;
    private children: TaskEntity[];
    private index: number; // 0-based number, showing the order of task within it's siblings

    constructor(task: ITask) {
        this.task = task;
        this.children = [];
    }

    public addChild(task: ITask) {
        const newTask = new TaskEntity(task);
        newTask.parent = this;
        newTask.index = this.children.length;
        this.children.push(newTask);
    }

    public getChildren(): TaskEntity[] {
        return this.children;
    }
}