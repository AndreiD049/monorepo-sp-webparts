import { SPnotify } from 'sp-react-notifications';
import IConfigCondition, { ConditionKey } from '../models/IConfigCondition';
import IUser from '../models/IUser';

export class ConditionChecker {
    constructor(
        private currentUser: IUser,
        private selectedUser: IUser,
        private selectedTeam: string
    ) {}

    checkCondition(condition: IConfigCondition): boolean {
        if (!condition) return true;
        let result = true;
        if (condition.current) {
            const keys = Object.keys(condition.current) as ConditionKey[];
            const results = keys.map((k) =>
                this.checkKey(
                    k,
                    condition.current[k],
                    this.currentUser.Email,
                    this.currentUser.role,
                    this.currentUser.teams,
                    this.currentUser.groups.map((g) => g.Title)
                )
            );
            result = results.every((r) => r === true);
        }
        if (result && condition.selected) {
            const keys = Object.keys(condition.selected) as ConditionKey[];
            const results = keys.map((k) =>
                this.checkKey(
                    k,
                    condition.selected[k],
                    this.selectedUser.Email,
                    this.selectedUser.role,
                    this.selectedUser.teams,
                    this.selectedUser.groups.map((g) => g.Title)
                )
            );
            result = results.every((r) => r === true);
        }
        return result;
    }

    checkConditions(conditions: IConfigCondition[]): boolean {
        if (!conditions?.length) return true;
        return conditions.some((c) => this.checkCondition(c));
    }

    private checkKey(
        key: ConditionKey,
        value: string | string[],
        email: string,
        role: string,
        teams: string[],
        groups: string[]
    ): boolean {
        switch (key) {
            case 'email':
                return this.compare(value, email);
            case 'role':
                return this.compare(value, role);
            case 'teams':
                return this.compare(value, teams);
            case 'groups':
                return this.compare(value, groups);
            default:
                this.error(`Unknown condition key '${key}'. Check configuration`);
                break;
        }
    }

    private compare(configValue: string | string[], userValue: string | string[]): boolean {
        // if we compare arrays, then all configValues should be found in userValues
        if (Array.isArray(configValue) && Array.isArray(userValue)) {
            const userSet = new Set(userValue.map((uv) => uv.toLowerCase()));
            return configValue.every((v) => userSet.has(v.toLowerCase()));
        } else if (typeof configValue === 'string' && typeof userValue === 'string') {
            return configValue.toLowerCase() === userValue.toLowerCase();
        } else {
            this.error(
                `Invalid configuration. Cannot compare different types for values '${configValue}' and '${userValue}'`
            );
        }
    }

    private error(message: string): void {
        SPnotify({
            message,
            messageType: 1,
        });
        throw Error(message);
    }
}
