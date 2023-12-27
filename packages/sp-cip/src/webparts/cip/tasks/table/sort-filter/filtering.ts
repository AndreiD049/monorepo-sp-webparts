import { ITaskOverview } from "@service/sp-cip/dist/models/ITaskOverview";

type TaskFilter = (task: ITaskOverview) => boolean;

export function applyFilters(tasks: ITaskOverview[], filters: TaskFilter[]): ITaskOverview[] {
	if (filters.length === 0) {
		return tasks;
	}
	return tasks.filter((task) => filters.every((filter) => filter(task)));
}

export function applySearch(tasks: ITaskOverview[], search: string): ITaskOverview[] {
	search = search.toLowerCase();
	return tasks.filter((task) => {
		return (
			task.Title.toLowerCase().includes(search) ||
			task.Description?.toLowerCase().includes(search)
		);
	});
}
