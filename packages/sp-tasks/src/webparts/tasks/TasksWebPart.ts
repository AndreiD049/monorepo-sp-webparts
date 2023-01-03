import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
    PropertyPaneButton,
    PropertyPaneButtonType,
    PropertyPaneSlider,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'TasksWebPartStrings';
import Tasks from './components/Tasks';
import { setupLists } from './utils/setup-lists';
import GlobalContext from './utils/GlobalContext';
import UserService from './services/users';
import TeamService from './services/teams';
import { ACCESS_EDIT_OTHERS, ACCESS_SEE_ALL, USER_WEB_RE } from './utils/constants';
import SPBuilder, { InjectHeaders } from 'sp-preset';
import PropertyPaneAccessControl, {
    canCurrentUser,
    IUserGroupPermissions,
    setupAccessControl,
} from 'property-pane-access-control';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { getTheme } from 'office-ui-fabric-react';
import { TaskLogsService, TaskService } from '@service/sp-tasks';
import { TaskSync } from './services/taskSync';

export interface ITasksWebPartProps {
    dataSourceRoot: string;
    tasksListTitle: string;
    taskLogsListTitle: string;
    staffListUrl: string;
    maxPeople: number;
    userColumn: string;
    teamColumn: string;
    roleColumn: string;
    permissions: IUserGroupPermissions;
}

export default class TasksWebPart extends BaseClientSideWebPart<ITasksWebPartProps> {
    static SPBuilder: SPBuilder;
    static theme: IReadonlyTheme = getTheme();

    public async render(): Promise<void> {
        const userServeice = new UserService();
        const teamService = new TeamService(
            this.properties.staffListUrl,
            this.properties.userColumn,
            this.properties.teamColumn,
            this.properties.roleColumn
        );
        const canSeeAll = await canCurrentUser(ACCESS_SEE_ALL, this.properties.permissions);
        const element: React.ReactElement = React.createElement(
            GlobalContext.Provider,
            {
                value: {
                    TaskService: new TaskService({
                        sp: TasksWebPart.SPBuilder.getSP(this.properties.dataSourceRoot),
                        listName: this.properties.tasksListTitle,
                    }),
                    TaskLogsService: new TaskLogsService({
                        sp: TasksWebPart.SPBuilder.getSP(this.properties.dataSourceRoot),
                        listName: this.properties.taskLogsListTitle,
                    }),
                    UserService: userServeice,
                    TeamService: teamService,
                    currentUser: await teamService.getCurrentUser(),
                    teamMembers: canSeeAll
                        ? await teamService.getAllUserTeams()
                        : await teamService.getCurrentUserTeamMembers(),
                    canEditOthers: await canCurrentUser(
                        ACCESS_EDIT_OTHERS,
                        this.properties.permissions
                    ),
                    canSeeAll: canSeeAll,
                    maxPeople: this.properties.maxPeople,
                    taskSyncService: new TaskSync({
                        sp: TasksWebPart.SPBuilder.getSP(this.properties.dataSourceRoot),
                        listName: this.properties.tasksListTitle,
                    }),
                    taskLogSyncService: new TaskSync({
                        sp: TasksWebPart.SPBuilder.getSP(this.properties.dataSourceRoot),
                        listName: this.properties.taskLogsListTitle,
                    }),
                },
            },
            React.createElement(Tasks)
        );

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        super.onInit();

        const userWebUrl = this.properties.staffListUrl?.match(USER_WEB_RE)[1];

        setupAccessControl(this.context);

        TasksWebPart.SPBuilder = new SPBuilder(this.context)
            .withRPM(1000)
            .withTennants({
                Data: this.properties.dataSourceRoot,
                Users: userWebUrl,
            })
            .withAdditionalTimelines([
                InjectHeaders({
                    Accept: 'application/json;odata=nometadata',
                }),
            ]);
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected onThemeChanged(theme: IReadonlyTheme): void {
        TasksWebPart.theme = theme;
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    groups: [
                        {
                            groupName: strings.DataSource,
                            groupFields: [
                                PropertyPaneTextField('dataSourceRoot', {
                                    label: strings.RootFieldLabel,
                                }),
                                PropertyPaneTextField('tasksListTitle', {
                                    label: strings.TasksFieldLabel,
                                }),
                                PropertyPaneTextField('taskLogsListTitle', {
                                    label: strings.TaskLogsFieldLabel,
                                }),
                                PropertyPaneButton('', {
                                    onClick: () => setupLists(this.properties),
                                    text: 'Create lists',
                                    buttonType: PropertyPaneButtonType.Primary,
                                    icon: 'Add',
                                }),
                            ],
                        },
                        {
                            groupName: strings.StaffGroupName,
                            groupFields: [
                                PropertyPaneTextField('staffListUrl', {
                                    label: strings.StaffListLabel,
                                }),
                                PropertyPaneSlider('maxPeople', {
                                    label: 'Maximum # of users',
                                    min: 0,
                                    max: 15,
                                    value: this.properties.maxPeople || 0,
                                }),
                                PropertyPaneTextField('userColumn', {
                                    label: strings.UserColumnNameLabel,
                                }),
                                PropertyPaneTextField('teamColumn', {
                                    label: strings.TeamColumnNameLabel,
                                }),
                                PropertyPaneTextField('roleColumn', {
                                    label: strings.RoleColumnNameLabel,
                                }),
                            ],
                        },
                        {
                            groupName: 'Access',
                            groupFields: [
                                PropertyPaneAccessControl('permissions', {
                                    key: 'access',
                                    context: this.context,
                                    permissions: [ACCESS_EDIT_OTHERS, ACCESS_SEE_ALL],
                                    selectedUserGroups: this.properties.permissions,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
