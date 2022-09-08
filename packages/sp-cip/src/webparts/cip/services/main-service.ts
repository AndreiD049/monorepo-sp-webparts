import {
    ActionService,
    AttachmentService,
    CommentService,
    TaskService,
} from '@service/sp-cip';
import SPBuilder from 'sp-preset';
import CipWebPart, { ICipWebPartProps } from '../CipWebPart';
import { UserService } from './user-service';

export default class MainService {
    private static taskServices: Map<string, TaskService>;
    private static userServices: Map<string, UserService>;
    private static commentServices: Map<string, CommentService>;
    private static attachmentServices: Map<string, AttachmentService>;
    private static actionServices: Map<string, ActionService>;
    private static builder: SPBuilder;

    public static InitServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ) {
        this.builder = CipWebPart.SPBuilder;
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
            new TaskService({
                sp: this.builder.getSP(defaultKey),
                listName: properties.config.listName,
            })
        );
        properties.config.remotes.forEach((remote) =>
            this.taskServices.set(
                remote.Name,
                new TaskService({
                    sp: this.builder.getSP(remote.Name),
                    listName: remote.ListTitle,
                })
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
            new CommentService({
                sp: this.builder.getSP(defaultKey),
                listName: properties.config.commentListName,
                taskListName: properties.config.listName,
            })
        );
        properties.config.remotes.forEach((remote) =>
            this.commentServices.set(
                remote.Name,
                new CommentService({
                    sp: this.builder.getSP(remote.Name),
                    listName: properties.config.commentListName,
                    taskListName: properties.config.listName,
                })
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
            new ActionService({
                sp: this.builder.getSP(defaultKey),
                listName: properties.config.commentListName,
                taskListName: properties.config.listName,
            })
        );
        properties.config.remotes.forEach((remote) =>
            this.actionServices.set(
                remote.Name,
                new ActionService({
                    sp: this.builder.getSP(remote.Name),
                    listName: properties.config.commentListName,
                    taskListName: properties.config.listName,
                })
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
            new AttachmentService({
                sp: this.builder.getSP(defaultKey),
                listName: properties.config.attachmentsPath,
            })
        );
        properties.config.remotes.forEach((remote) =>
            this.attachmentServices.set(
                remote.Name,
                new AttachmentService({
                    sp: this.builder.getSP(remote.Name),
                    listName: properties.config.attachmentsPath,
                })
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
