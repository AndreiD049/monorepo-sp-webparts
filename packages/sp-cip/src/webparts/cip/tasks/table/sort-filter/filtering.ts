import { uniq } from "@microsoft/sp-lodash-subset";
import { ITaskOverview } from "@service/sp-cip/dist/models/ITaskOverview";

type TaskFilter = (task: ITaskOverview) => boolean;

export function applyFilters(tasks: ITaskOverview[], filters: TaskFilter[]) {
	if (filters.length === 0) {
		return tasks;
	}
	const taskMap = new Map(tasks.map((task) => [task.Id, task]));
	// Get all parent Id's
	const parentIds = uniq(tasks.map((task) => task.ParentId ? task.ParentId : task.Id));
	const parentVisibility: { [key: number]: boolean } = {};
	// Check if parent is visible
	parentIds.forEach((parentId) => {
		const parent = taskMap.get(parentId);
		if (parent) {
			parentVisibility[parentId] = filters.every((filter) => filter(parent));
		}
	});
	return tasks.filter((task) => {
		let visible = false;
		// If we already calculated parent visibility, use that
		if (parentVisibility[task.Id]) {
			visible = true;
		} else {
			// else, calculate it
			visible = filters.every((filter) => filter(task));
		}
		// If filters passed, show the task
		if (visible) {
			return true;
		}
		// Else, check if parent is visible, and if it is show the subtask as well
		// even if it doesn't pass the filters
		let parentVisible = false;
		if (task.ParentId) {
			parentVisible = parentVisibility[task.ParentId];
		}
		return parentVisible;
	});
}

export function applySearch(tasks: ITaskOverview[], search: string) {
	search = search.toLowerCase();
	return tasks.filter((task) => {
		return (
			task.Title.toLowerCase().includes(search) ||
			task.Description?.toLowerCase().includes(search)
		);
	});
}
