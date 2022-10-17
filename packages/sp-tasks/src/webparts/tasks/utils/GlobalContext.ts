import * as React from 'react';
import { IUser } from '../models/IUser';
import TaskLogsService from '../services/tasklogs';
import TaskService from '../services/tasks';
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
});

export default GlobalContext;
