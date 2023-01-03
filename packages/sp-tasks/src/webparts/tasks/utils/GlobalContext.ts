import { TaskLogsService, TaskService } from '@service/sp-tasks';
import * as React from 'react';
import { IUser } from '../models/IUser';
import { TaskSync } from '../services/taskSync';
import TeamService from '../services/teams';
import UserService from '../services/users';
import ITeams from './ITeams';

export interface IGlobalContext {
    TaskService: TaskService;
    TaskLogsService: TaskLogsService;
    UserService: UserService;
    TeamService: TeamService;
    currentUser: IUser;
    teamMembers: ITeams<IUser>;
    canEditOthers: boolean;
    canSeeAll: boolean;
    maxPeople: number;
    taskSyncService: TaskSync;
    taskLogSyncService: TaskSync;
}

const GlobalContext = React.createContext<IGlobalContext>({
    TaskService: null,
    TaskLogsService: null,
    UserService: null,
    TeamService: null,
    currentUser: null,
    teamMembers: null,
    canEditOthers: false,
    canSeeAll: false,
    maxPeople: 1,
    taskSyncService: null,
    taskLogSyncService: null,
});

export default GlobalContext;
