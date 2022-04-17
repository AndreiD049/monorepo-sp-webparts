import { DateTime } from "luxon";
import { WeekDay } from "../models/ITask";
import { getNthWorkday, getNumberOfWorkdaysInMonth, getWeekDaySet, isCurrentWorkday } from "./utils";

test('Able to get number of workdays in month', () => {
    const dt = DateTime.fromISO('2022-03-22');
    expect(getNumberOfWorkdaysInMonth(dt)).toBe(23);
});

test('Able to get number of workdays in june', () => {
    const dt = DateTime.fromISO('2022-06-22');
    expect(getNumberOfWorkdaysInMonth(dt)).toBe(22);
});

test('Get nth workday from the first week', () => {
    let dt = DateTime.fromISO('2022-03-01');
    expect(getNthWorkday(dt)).toBe(1);
    dt = DateTime.fromISO('2022-03-02');
    expect(getNthWorkday(dt)).toBe(2);
    dt = DateTime.fromISO('2022-03-03');
    expect(getNthWorkday(dt)).toBe(3);
    dt = DateTime.fromISO('2022-03-04');
    expect(getNthWorkday(dt)).toBe(4);
});

test('Get nth workday weekend', () => {
    const dt = DateTime.fromISO('2022-03-27');
    expect(getNthWorkday(dt)).toBe(0);
});

test('Get nth workday from second week', () => {
    let dt = DateTime.fromISO('2022-03-07');
    expect(getNthWorkday(dt)).toBe(5);
    dt = DateTime.fromISO('2022-03-08');
    expect(getNthWorkday(dt)).toBe(6);
    dt = DateTime.fromISO('2022-03-09');
    expect(getNthWorkday(dt)).toBe(7);
    dt = DateTime.fromISO('2022-03-10');
    expect(getNthWorkday(dt)).toBe(8);
    dt = DateTime.fromISO('2022-03-11');
    expect(getNthWorkday(dt)).toBe(9);
});

test('Get nth workday in the last week', () => {
    let dt = DateTime.fromISO('2022-03-22');
    expect(getNthWorkday(dt)).toBe(16);
    dt = DateTime.fromISO('2022-03-29');
    expect(getNthWorkday(dt)).toBe(21);
    expect(getNthWorkday(dt.endOf('month')))
        .toBe(getNumberOfWorkdaysInMonth(dt));
});

test('Get weekday set when empty', () => {
    expect(getWeekDaySet([]).size).toBe(0);
});

test('Get weekday set whole week', () => {
    const set = getWeekDaySet([
        WeekDay.Mon,
        WeekDay.Tue,
        WeekDay.Wed,
        WeekDay.Thu,
        WeekDay.Fri,
        WeekDay.Sat,
        WeekDay.Sun,
    ]);
    expect(set.has(1)).toBeTruthy();
    expect(set.has(2)).toBeTruthy();
    expect(set.has(3)).toBeTruthy();
    expect(set.has(4)).toBeTruthy();
    expect(set.has(5)).toBeTruthy();
    expect(set.has(6)).toBeTruthy();
    expect(set.has(7)).toBeTruthy();
});

test('Get weekday set missing day', () => {
    const set = getWeekDaySet([
        WeekDay.Mon,
        WeekDay.Tue,
        WeekDay.Thu,
        WeekDay.Fri,
        WeekDay.Sat,
        WeekDay.Sun,
    ]);
    expect(set.has(3)).toBeFalsy();
});

test('today date is current workday', () => {
    expect(isCurrentWorkday(DateTime.now())).toBe(true);
})

test('today before 06 AM is current workday', () => {
    const dt = DateTime.now().set({
        hour: 5,
    });
    expect(isCurrentWorkday(dt)).toBe(true);
})

test('tomorrow is not current workday', () => {
    const dt = DateTime.now().plus({ 'day': 1 });
    expect(isCurrentWorkday(dt)).toBe(false);
});

test('yesterday is current workday if today is before 06:00', () => {
    const dt = DateTime.now().minus({ day: 1 });
    jest.spyOn(DateTime, 'now').mockReturnValueOnce(DateTime.now().set({ hour: 5 }));
    expect(isCurrentWorkday(dt)).toBe(true);
});

test('yesterday is not current workday if it\'s past 06:00', () => {
    const dt = DateTime.now().minus({ day: 1 });
    jest.spyOn(DateTime, 'now').mockReturnValueOnce(DateTime.now().set({ hour: 9 }));
    expect(isCurrentWorkday(dt)).toBe(false);
});

test('2 days before is not current workday if it\'s before 06:00', () => {
    const dt = DateTime.now().minus({ day: 2 });
    jest.spyOn(DateTime, 'now').mockReturnValueOnce(DateTime.now().set({ hour: 4 }));
    expect(isCurrentWorkday(dt)).toBe(false);
});

test('tomorrow is not current workday if it\'s before 06:00', () => {
    const dt = DateTime.now().plus({ day: 1 });
    jest.spyOn(DateTime, 'now').mockReturnValueOnce(DateTime.now().set({ hour: 5 }));
    expect(isCurrentWorkday(dt)).toBe(false);
});

test('future daye is not current workday if it\'s before 06:00', () => {
    const dt = DateTime.now().plus({ day: 3 });
    jest.spyOn(DateTime, 'now').mockReturnValueOnce(DateTime.now().set({ hour: 5 }));
    expect(isCurrentWorkday(dt)).toBe(false);
});

test('future daye is not current workday if it\'s past 06:00', () => {
    const dt = DateTime.now().plus({ day: 3 });
    jest.spyOn(DateTime, 'now').mockReturnValueOnce(DateTime.now().set({ hour: 9 }));
    expect(isCurrentWorkday(dt)).toBe(false);
});