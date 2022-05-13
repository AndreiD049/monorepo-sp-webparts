import { IClonable } from "../../utils/IClonable";
import { ITaskOverview } from "../ITaskOverview";

type NodeType = 'root' | 'normal' | 'proxy' | 'stub';

export class TaskNode implements IClonable<TaskNode> {
    private type: NodeType;
    private children: Map<number, TaskNode>;
    private parent?: TaskNode;
    public Id: number;
    public level: number;

    constructor(private task?: ITaskOverview) {
        this.children = new Map();
        this.Id = this.task?.Id;
        this.level = -1;
        if (!task) {
            this.type = 'root';
        } else if (this.task.SubtasksId?.length > 0) {
            this.type = 'proxy';
        } else {
            this.type = 'normal';
        }
    }
    
    public withChildren(tasks: ITaskOverview[]) {
        if (tasks.length > 0) {
            if (this.type !== 'root') {
                this.type = 'normal';
            }
            this.children = new Map();
            for (const task of tasks) {
                const node = new TaskNode(task)
                    .withParent(this)
                    .withLevel(this.level + 1);
                this.children.set(task.Id, node);
            }
        }
        return this;
    }

    public withLevel(level: number) {
        this.level = level;
        this.children.forEach((child) => child.withLevel(this.level + 1));
        return this;
    }

    public setChild(child: TaskNode) {
        if (this.type === 'proxy') {
            this.type = 'normal';
        }
        this.children.set(child.task.Id, child.withLevel(this.level + 1));
    }
    
    public withParent(parent: TaskNode) {
        this.parent = parent;
        if (parent) {
            parent.setChild(this);
        }
        return this;
    }

    public withTask(task: ITaskOverview) {
        this.task = task;
        return this;
    }
    
    clone(): TaskNode {
        const copy =  new TaskNode(this.task)
            .withParent(this.parent)
            .withLevel(this.level);
        this.children.forEach(child => copy.setChild(child));
        return copy;
    }

    public getTask(): ITaskOverview {
        return this.task;
    }

    public getType(): NodeType {
        return this.type;
    }

    public getChildren(): TaskNode[] {
        return Array.from(this.children.values());
    }

    public getParent(): TaskNode {
        return this.parent || null;
    }
}