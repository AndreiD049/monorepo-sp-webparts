// @ts-nocheck
import ITask from "./ITaskOverview";
import TaskEntity from "./task-entity";

function createTask(id: number): ITask {
    return {
        Id: id,
        Title: `Task${id}`,
        DueDate: '2021-01-01T10:00:00',
        StartDate: '2021-01-01T10:00:00',
        FinishDate: '2021-01-01T10:00:00',
        Responsible: {
            Id: 1,
            Title: 'Andrei',
            LoginName: 'Andrei|sometext@somecompany.com|#1',
            EMail: 'andrei@somecompany.com'
        },
        EffectiveTime: 0,
        EstimatedTime: 10,
        Progress: 0,
        Status: 'New',
        Team: 'Team',
    }
}

it('Should add a child correctly', () => {
    const parent = new TaskEntity(createTask(1));
    expect(parent.getChildren().length).toBe(0);
    parent.addChild(createTask(2));
    expect(parent.getChildren().length).toBe(1);
    const child = parent.getChildren()[0];
    expect(child.task.Id).toBe(2);
    expect(child.parent.task.Id).toBe(1);
});