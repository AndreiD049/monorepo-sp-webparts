import {
    ActionService,
    AttachmentService,
    CommentService,
    TaskService,
} from '@service/sp-cip';
import SPBuilder from 'sp-preset';
import CipWebPart, { ICipWebPartProps } from '../CipWebPart';
import { createCacheProxy } from 'idb-proxy';
import { UserService } from './user-service';
import { taskServiceProxyOptions, userServiceProxyOptions } from './cache-proxy-options';

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
    ): void {
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
    ): void {
        this.taskServices = new Map();
        this.taskServices.set(
            defaultKey,
            createCacheProxy(new TaskService({
                sp: this.builder.getSP(defaultKey),
                listName: properties.config.listName,
            }), taskServiceProxyOptions(defaultKey))
        );
        properties.config.remotes.forEach((remote) =>
            this.taskServices.set(
                remote.Name,
                createCacheProxy(new TaskService({
                    sp: this.builder.getSP(remote.Name),
                    listName: remote.ListTitle,
                }), taskServiceProxyOptions(remote.Name))
            )
        );
    }

    private static InitUserServices(
        defaultKey: string,
        properties: ICipWebPartProps
    ): void {
        this.userServices = new Map();
        this.userServices.set(
            defaultKey,
            createCacheProxy(new UserService(defaultKey, properties), userServiceProxyOptions(defaultKey))
        );
        properties.config.remotes.forEach((remote) =>
            this.userServices.set(
                remote.Name,
                createCacheProxy(new UserService(remote.Name, properties), userServiceProxyOptions(remote.Name))
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
    ): void {
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
    ): void {
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

    public static getTaskService(tennantKey: string = 'Data'): TaskService {
        return this.taskServices.get(tennantKey);
    }

    public static getUserService(tennantKey: string = 'Data'): UserService {
        return this.userServices.get(tennantKey);
    }

    public static getCommentService(tennantKey: string = 'Data'): CommentService {
        return this.commentServices.get(tennantKey);
    }

    public static getAttachmentService(tennantKey: string = 'Data'): AttachmentService {
        return this.attachmentServices.get(tennantKey);
    }

    public static getActionService(tennantKey: string = 'Data'): ActionService {
        return this.actionServices.get(tennantKey);
    }
}
