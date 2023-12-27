import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IClonable } from '../../utils/IClonable';

type NodeType = 'root' | 'normal' | 'stub';

export class TaskNode implements IClonable<TaskNode> {
    private type: NodeType;
    private children: Map<number, TaskNode>;
    private childrenArray: TaskNode[] = [];
    private parent?: TaskNode;
    private index: number = 0;
    public Id: number;
    public level: number;
    public Category: string;
    public isOrphan: boolean = false;

    constructor(private task?: ITaskOverview) {
        this.children = new Map();
        this.Id = this.task?.Id;
        this.Category = this.task?.Category || 'Other';
        this.level = -1;
        if (!task) {
            this.type = 'root';
        } else {
            this.type = 'normal';
        }
    }

    public withChildren(tasks: ITaskOverview[] | TaskNode[]): TaskNode {
        if (tasks.length > 0) {
			this.type = 'normal';
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

    private withLevel(level: number): TaskNode {
        this.level = level;
        this.children.forEach((child) => child.withLevel(this.level + 1));
        return this;
    }

    private withIndex(idx: number): TaskNode {
        this.index = idx;
        return this;
    }

    public setChild(child: TaskNode): void {
        child.parent = this;
		let index = this.childrenArray.length;
		const found = this.childrenArray.findIndex((x) => x.task.Id === child.task.Id);
		if (found !== -1) {
			index = found;
		}
        child.withIndex(index);
        this.children.set(child.task.Id, child.withLevel(this.level + 1));
		if (index < this.childrenArray.length) {
			this.childrenArray.splice(index, 1, child);
		} else {
			this.childrenArray.push(child);
		}
    }

    public withParent(parent: TaskNode): TaskNode {
        this.parent = parent;
        if (parent) {
            parent.setChild(this);
        }
        return this;
    }

    public withTask(task: ITaskOverview): TaskNode {
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

    public getPreviousSibling(): TaskNode | undefined {
        if (this.index === 0) return null;
        const parent = this.getParent();
        if (!parent) return null;
        if (parent.children.size <= this.index - 1) return null;
        return parent.getChildren()[this.index - 1];
    }

    public getNextSibling(): TaskNode | undefined {
        const parent = this.getParent();
        if (!parent) return null;
        if (parent.children.size <= this.index + 1) return null;
        return parent.getChildren()[this.index + 1];
    }
	
	public getDescendantsAndSelf(): TaskNode[] {
		const descendants = this.getDescendants();
		descendants.push(this);
		return descendants;
	}

	public getDescendants(): TaskNode[] {
		const descendants: TaskNode[] = [];
		for (const child of this.getChildren()) {
			descendants.push(child);
			if (child.hasChildren()) {
				descendants.push(...child.getDescendants());
			}
		}
		return descendants;
	}
}
