// @ts-nocheck
import { TaskNode } from "./TaskNode"

const dummyTask: ITaskOverview = {
    Id: 1,
    DueDate: '2022-01-01T10:00:00',
    EffectiveTime: 1,
    EstimatedTime: 10,
    Priority: 'Low',
    Progress: 0,
    Responsible: {
        Id: 1,
        EMail: 'dummy@dummy.com',
        Title: 'Dummy Dum'
    },
    Status: 'New',
    Team: 'BSG',
    Title: 'Dummy daily task',
    Subtasks: 0,
    ParentId: null,
};

it('Should be able to contruct a node from a task', () => {
    const node = new TaskNode(dummyTask);
    expect(node.getTask().Id).toBe(1);
});

it('Should be possible to add children to a task', () => {
    const parent = new TaskNode(dummyTask);
    const child = new TaskNode({...dummyTask, Id: 2, Subtasks: 1})
        .withParent(parent);
    expect(parent.children.size).toBe(1);
    expect(child.parent.getTask().Id).toBe(1);
    expect(child.type).toBe('proxy');
    expect(parent.type).toBe('normal');
});

it('Should be possible to add children', () => {
    const children = [
        {...dummyTask, Id: 2},
        {...dummyTask, Id: 3},
        {...dummyTask, Id: 4},
    ];
    const parent = new TaskNode(dummyTask)
        .withChildren(children);

    expect(parent.type).toBe('normal');
    expect(parent.children.size).toBe(3);
    parent.getChildren().forEach((child) => {
        expect(child.getParent().getTask().Id).toBe(1);
        expect(child.type).toBe('normal');
    })
})
