import { IClonable } from '../../utils/IClonable';
import { ITaskOverview } from '../ITaskOverview';

type NodeType = 'root' | 'normal' | 'proxy' | 'stub';

export class TaskNode implements IClonable<TaskNode> {
    private type: NodeType;
    private children: Map<number, TaskNode>;
    private childrenArray: TaskNode[] = [];
    private parent?: TaskNode;
    private index: number = 0;
    public Id: number;
    public level: number;
    public Category: string;
    public Display: 'shown' | 'hidden' | 'disabled';
    public isFilterApplicable: boolean;
    public isOrphan: boolean = false;

    constructor(private task?: ITaskOverview) {
        this.children = new Map();
        this.Id = this.task?.Id;
        this.Category = this.task?.Category || 'Other';
        this.level = -1;
        this.Display = 'shown';
        this.isFilterApplicable = true;
        if (!task) {
            this.type = 'root';
        } else if (this.task.Subtasks > 0) {
            this.type = 'proxy';
        } else {
            this.type = 'normal';
        }
    }

    public withChildren(tasks: ITaskOverview[] | TaskNode[]) {
        if (tasks.length > 0) {
            if (this.type !== 'root') {
                this.type = 'normal';
            }
            this.children = new Map();
            this.childrenArray = [];
            for (const task of tasks) {
                if (task instanceof TaskNode) {
                    task.withParent(this).withLevel(this.level + 1)
                } else {
                    new TaskNode(task).withParent(this).withLevel(this.level + 1);
                }
            }
        }
        return this;
    }

    public withLevel(level: number) {
        this.level = level;
        this.children.forEach((child) => child.withLevel(this.level + 1));
        return this;
    }

    public withIndex(idx: number) {
        this.index = idx;
        return this;
    }

    public setChild(child: TaskNode) {
        child.parent = this;
        child.withIndex(this.children.size);
        this.children.set(child.task.Id, child.withLevel(this.level + 1));
        this.childrenArray.push(child);
        if (this.type === 'proxy') {
            this.type = 'normal';
        }
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
        const copy = new TaskNode(this.task)
            .withParent(this.parent)
            .withLevel(this.level);
        this.children.forEach((child) => copy.setChild(child));
        return copy;
    }

    public getTask(): ITaskOverview {
        return this.task;
    }

    public getType(): NodeType {
        return this.type;
    }

    public getChildren(): TaskNode[] {
        return this.childrenArray;
    }

    public hasChildren(): boolean {
        return this.childrenArray.length > 0;
    }

    public getParent(): TaskNode {
        return this.parent || null;
    }

    public getPreviousSibling(): TaskNode | null {
        if (this.index === 0) return null;
        const parent = this.getParent();
        if (!parent) return null;
        if (parent.children.size <= this.index - 1) return null;
        return parent.getChildren()[this.index - 1];
    }

    public getNextSibling(): TaskNode | null {
        const parent = this.getParent();
        if (!parent) return null;
        if (parent.children.size <= this.index + 1) return null;
        return parent.getChildren()[this.index + 1];
    }

    public getAllDescendants(): TaskNode[] {
        const result = [];
        this.getChildren().forEach((child) => { 
            result.push(child);
            result.push(...child.getAllDescendants());
        });
        return result;
    }

    public filter(filter: ((node: TaskNode) => boolean)) {
        const filtered = this.getChildren().filter((c: TaskNode) => filter(c));
        this.withChildren(filtered);
        return this;
    }

    public hide(filters: ((node: TaskNode) => boolean)[]) {
        this.getChildren().forEach((n) => {
            if (filters.every((filter) => filter(n))) {
                n.Display = 'shown';
            } else {
                n.Display = 'hidden';
            }
        })
        return this;
    }
}
