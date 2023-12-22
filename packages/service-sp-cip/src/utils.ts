import { IItems, PagedItemCollection } from 'sp-preset';
import { ITaskOverview } from './models/ITaskOverview';

export const isFinished = (task: ITaskOverview): boolean => {
    if (task.FinishDate === null) return false;
    const date = new Date(task.FinishDate);
    return date instanceof Date && date.getTime && !isNaN(date.getTime());
};

export const dateODataFormat = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export async function getAllPaged<T>(request: IItems, maxPages: number = 10) {
    const result: T[] = [];
    let items: PagedItemCollection<T> | null = await request.getPaged();
    result.push(items.results);
    for (let i = 0; i < maxPages && items?.hasNext; i++) {
        items = await items.getNext();
        items && result.push(items.results);
    }
    return result.flat();
}

export function statusToFilter(status: 'Open' | 'Finished' | 'All') {
    switch (status) {
        case 'Finished':
            return 'FinishDate ne null';
        case 'Open':
            return 'FinishDate eq null';
		default:
			return '';
    }
}
