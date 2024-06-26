import { ICommentInfo, IEmailProperties, IList, SPFI } from "sp-preset";
import { IServiceProps } from "../models/IServiceProps";
import { ITaskComment } from "../models/ITaskComment";
import { ITaskOverview } from "../models/ITaskOverview";
import { commentBody } from "./constants";
import { TaskService } from "./task-service";

const COMMENTS_SELECT = [
	"Id",
	"ListId",
	"ItemId",
	"Comment",
	"ActivityType",
	"Created",
	"Author/Title",
	"Author/EMail",
	"Author/Id",
	"Date",
	"User/Title",
	"User/EMail",
	"User/Id",
];
const COMMENTS_EXPAND = ["Author", "User"];

export interface IPagedCollection<T> {
	hasNext: boolean;
	getNext: () => Promise<IPagedCollection<T> | null>;
	results: T;
}

export interface ICommentServiceProps extends IServiceProps {
	taskListName: string;
}
export class CommentService {
	private taskListId: Promise<string>;
	private sp: SPFI;
	private list: IList;
	private taskService: TaskService;

	constructor(props: ICommentServiceProps) {
		this.sp = props.sp;
		this.taskListId = this.sp.web.lists
			.getByTitle(props.taskListName)
			.select("Id")()
			.then((l) => l.Id.toString());
		this.list = this.sp.web.lists.getByTitle(props.listName);
		this.taskService = new TaskService({
			sp: props.sp,
			listName: props.taskListName,
		});
	}

	getAllRequest = (listId: string) => {
		return this.list.items
			.filter(`ActivityType eq 'Comment' and ListId eq '${listId}'`)
			.select(...COMMENTS_SELECT);
	};

	async getAll(): Promise<ITaskComment[]> {
		return this.getAllRequest(await this.taskListId)();
	}

	async addComment(
		task: ITaskOverview,
		comment: string,
		userId?: number,
		date?: string
	) {
		const payload: ITaskComment = {
			ListId: await this.taskListId,
			ItemId: task.Id,
			ActivityType: "Comment",
			Comment: comment,
		};
		if (userId) payload.UserId = userId;
		if (date) payload.Date = date;

		const added = await this.list.items.add(payload);

		await this.taskService.commentAdded(task.Id);

		return added;
	}

	async editComment(id: number, content: Partial<ITaskComment>) {
		return this.list.items.getById(id).update(content);
	}

	getByTaskRequest = (
		listId: string,
		taskId: number,
		top?: number,
		skip?: number
	) => {
		let result = this.list.items
			.filter(
				`ItemId eq ${taskId} and ListId eq '${listId}' and ActivityType eq 'Comment'`
			)
			.select(...COMMENTS_SELECT)
			.expand(...COMMENTS_EXPAND)
			.orderBy("Created", false);
		if (top) {
			result = result.top(top);
		}
		if (skip) {
			result = result.skip(skip);
		}
		return result;
	};

	async getByTask(
		task: ITaskOverview,
		top?: number,
		skip?: number
	): Promise<ITaskComment[]> {
		const listId = await this.taskListId;
		return this.getByTaskRequest(listId, task.Id, top, skip)();
	}

	async getByTaskPaged(
		task: ITaskOverview,
		pageSize: number
	): Promise<IPagedCollection<ITaskComment[]>> {
		return this.list.items
			.filter(
				`ItemId eq ${task.Id} and ListId eq '${await this.taskListId}' and ActivityType eq 'Comment'`
			)
			.select(...COMMENTS_SELECT)
			.expand(...COMMENTS_EXPAND)
			.orderBy("Created", false)
			.top(pageSize)
			.getPaged<ITaskComment[]>();
	}

	getCommentRequest(id: number) {
		return this.list.items
			.getById(id)
			.select(...COMMENTS_SELECT)
			.expand(...COMMENTS_EXPAND);
	}

	async getComment(id: number): Promise<ITaskComment> {
		return this.getCommentRequest(id)();
	}

	async sendCommentMessage(options: {
		fromEmail: string;
		fromName: string;
		task: ITaskOverview;
		baseUrl: string;
		comment: string;
		mentions: ICommentInfo["mentions"];
	}): Promise<void> {
		if (options.mentions && options.mentions.length > 0) {
			const mailProps: IEmailProperties = {
				From: options.fromEmail,
				To: options.mentions.map((m) => m.email),
				Body: commentBody(options.fromName, options.comment, options.baseUrl + `#/task/${options.task.Id}`, options.task.Title),
				Subject: `Comment mention - Task "${options.task.Title}"`,
			};
			return this.sp.utility.sendEmail(mailProps);
		}
	}
}
