import CipWebPart, { ICipWebPartProps } from '../CipWebPart';
import { AttachmentService } from './attachment-service';
import { CommentService } from './comment-service';
import { UserService } from './user-service';
import { ActionService, TaskService } from '@service/sp-cip';

export default class MainService {
    private static taskServices: Map<string, TaskService>;
    private static userServices: Map<string, UserService>;
    private static commentServices: Map<string, CommentService>;
    private static attachmentServices: Map<string, AttachmentService>;
    private static actionServices: Map<string, ActionService>;

    public static InitServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ) {
        this.InitTaskServices(defaultKey, properties);
        this.InitUserServices(defaultKey, properties);
        this.InitCommentService(defaultKey, properties);
        this.InitAttachmentService(defaultKey, properties);
        this.InitActionService(defaultKey, properties);
    }

    private static InitTaskServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ) {
        this.taskServices = new Map();
        this.taskServices.set(
            defaultKey,
            new TaskService(CipWebPart.SPBuilder, defaultKey, properties.config.listName)
        );
        properties.config.remotes.forEach((remote) =>
            this.taskServices.set(
                remote.Name,
                new TaskService(CipWebPart.SPBuilder, remote.Name, remote.ListTitle)
            )
        );
    }

    private static InitUserServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ) {
        this.userServices = new Map();
        this.userServices.set(
            defaultKey,
            new UserService(defaultKey, properties)
        );
        properties.config.remotes.forEach((remote) =>
            this.userServices.set(
                remote.Name,
                new UserService(remote.Name, properties)
            )
        );
    }

    private static InitCommentService(
        defaultKey: string,
        properties: ICipWebPartProps
    ) {
        this.commentServices = new Map();
        this.commentServices.set(
            defaultKey,
            new CommentService(defaultKey, properties)
        );
        properties.config.remotes.forEach((remote) =>
            this.commentServices.set(
                remote.Name,
                new CommentService(remote.Name, properties)
            )
        );
    }

    private static InitActionService(
        defaultKey: string,
        properties: ICipWebPartProps
    ) {
        this.actionServices = new Map();
        this.actionServices.set(
            defaultKey,
            new ActionService(CipWebPart.SPBuilder, defaultKey, properties.taskListId, properties.config.commentListName)
        );
        properties.config.remotes.forEach((remote) =>
            this.actionServices.set(
                remote.Name,
                new ActionService(CipWebPart.SPBuilder, remote.Name, properties.taskListId, properties.config.commentListName)
            )
        );
    }

    private static InitAttachmentService(
        defaultKey: string,
        properties: ICipWebPartProps
    ) {
        this.attachmentServices = new Map();
        this.attachmentServices.set(
            defaultKey,
            new AttachmentService(defaultKey, properties)
        );
        properties.config.remotes.forEach((remote) =>
            this.attachmentServices.set(
                remote.Name,
                new AttachmentService(remote.Name, properties)
            )
        );
    }

    public static getTaskService(tennantKey: string = 'Data') {
        return this.taskServices.get(tennantKey);
    }

    public static getUserService(tennantKey: string = 'Data') {
        return this.userServices.get(tennantKey);
    }

    public static getCommentService(tennantKey: string = 'Data') {
        return this.commentServices.get(tennantKey);
    }

    public static getAttachmentService(tennantKey: string = 'Data') {
        return this.attachmentServices.get(tennantKey);
    }

    public static getActionService(tennantKey: string = 'Data') {
        return this.actionServices.get(tennantKey);
    }
}
