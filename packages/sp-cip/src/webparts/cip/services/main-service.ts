import {
    ActionService,
    AttachmentService,
    CommentService,
    TaskService,
	NoteService
} from '@service/sp-cip';
import SPBuilder from 'sp-preset';
import CipWebPart, { ICipWebPartProps } from '../CipWebPart';
import { createCacheProxy } from 'idb-proxy';
import { UserService } from './user-service';
import {
    actionServiceProxyOptions,
    taskServiceProxyOptions,
    userServiceProxyOptions,
} from './cache-proxy-options';

export default class MainService {
    private static taskServices: Map<string, TaskService>;
    private static userServices: Map<string, UserService>;
    private static commentServices: Map<string, CommentService>;
    private static attachmentServices: Map<string, AttachmentService>;
    private static actionServices: Map<string, ActionService>;
    private static noteServices: Map<string, NoteService>;
    private static builder: SPBuilder;

    public static InitServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ): void {
        this.builder = CipWebPart.SPBuilder;
        this.InitTaskServices(defaultKey, properties);
        this.InitUserServices(defaultKey, properties);
        this.InitCommentService(defaultKey, properties);
        this.InitAttachmentService(defaultKey, properties);
        this.InitActionService(defaultKey, properties);
		this.InitNotesService(defaultKey, properties);
    }

    private static InitTaskServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ): void {
        this.taskServices = new Map();
        this.taskServices.set(
            defaultKey,
            createCacheProxy(
                new TaskService({
                    sp: this.builder.getSP(defaultKey),
                    listName: properties.config.listName,
                }),
                taskServiceProxyOptions(defaultKey)
            )
        );
    }

	private static InitNotesService(
        defaultKey: string,
        properties: ICipWebPartProps
	): void {
		this.noteServices = new Map();
		if (!properties.config.notesRoot) {
			return;
		}
		this.noteServices.set(
			defaultKey,
			new NoteService({
				sp: this.builder.getSP(defaultKey),
				listName: properties.config.notesRoot,
			})
		);
	}

    private static InitUserServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ): void {
        this.userServices = new Map();
        this.userServices.set(
            defaultKey,
            createCacheProxy(
                new UserService(defaultKey, properties),
                userServiceProxyOptions(defaultKey)
            )
        );
    }

    private static InitCommentService(
        defaultKey: string,
        properties: ICipWebPartProps
    ): void {
        this.commentServices = new Map();
        this.commentServices.set(
            defaultKey,
            new CommentService({
                sp: this.builder.getSP(defaultKey),
                listName: properties.config.commentListName,
                taskListName: properties.config.listName,
            })
        );
    }

    private static InitActionService(
        defaultKey: string,
        properties: ICipWebPartProps
    ): void {
        this.actionServices = new Map();
        this.actionServices.set(
            defaultKey,
            createCacheProxy(
                new ActionService({
                    sp: this.builder.getSP(defaultKey),
                    listName: properties.config.commentListName,
                    taskListName: properties.config.listName,
                }),
                actionServiceProxyOptions(defaultKey)
            )
        );
    }

    private static InitAttachmentService(
        defaultKey: string,
        properties: ICipWebPartProps
    ): void {
        this.attachmentServices = new Map();
        this.attachmentServices.set(
            defaultKey,
            new AttachmentService({
                sp: this.builder.getSP(defaultKey),
                listName: properties.config.attachmentsPath,
            })
        );
    }

    public static getTaskService(tennantKey: string = 'Data'): TaskService {
        return this.taskServices.get(tennantKey);
    }

    public static getUserService(tennantKey: string = 'Data'): UserService {
        return this.userServices.get(tennantKey);
    }

    public static getCommentService(
        tennantKey: string = 'Data'
    ): CommentService {
        return this.commentServices.get(tennantKey);
    }

    public static getAttachmentService(
        tennantKey: string = 'Data'
    ): AttachmentService {
        return this.attachmentServices.get(tennantKey);
    }

    public static getActionService(tennantKey: string = 'Data'): ActionService {
        return this.actionServices.get(tennantKey);
    }
	
	public static getNoteService(tennantKey: string = 'Data'): NoteService {
		return this.noteServices.get(tennantKey);
	}
}
