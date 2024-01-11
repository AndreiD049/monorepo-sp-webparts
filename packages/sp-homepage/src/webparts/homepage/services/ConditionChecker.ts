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
        console.log(`Condidtion - '${JSON.stringify(condition)}' is ${result}`);
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
            return this.compareLists(configValue, userValue);
        } else if (typeof configValue === 'string' && typeof userValue === 'string') {
            return this.compareString(configValue, userValue);
        } else if (userValue === null || userValue === undefined) {
            return typeof configValue === 'string' ? this.compareString(configValue, 'null') : this.compareLists(configValue, ['null']);
        } else {
            this.error(
                `Invalid configuration. Cannot compare different types for values '${configValue}' and '${userValue}'`
            );
        }
    }

    private compareString(configValue: string, userValue: string): boolean {
        if (configValue.startsWith("!")) {
            return configValue.slice(1).toLowerCase() !== userValue.toLowerCase();
        }
        return configValue.toLowerCase() === userValue.toLowerCase();
    }

    private compareLists(configValues: string[], userValues: string[]): boolean {
        const userSet = new Set(userValues.map((userValue) => userValue.toLowerCase()));
        return configValues.every((configValue) => {
            const value = configValue.slice(1).toLowerCase();
            if (configValue.startsWith("!")) {
                return !userSet.has(value);
            }
            return userSet.has(configValue.toLowerCase());
        })
    }

    private error(message: string): void {
        SPnotify({
            message,
            messageType: 1,
        });
        throw Error(message);
    }
}
