export type ConditionKey = keyof IConfigCondition["current"];

export default interface IConfigCondition {
    current: {
        email: string;
        role: string;
        teams: string[];
        groups: string[];
    },
    selected: {
        email: string;
        role: string;
        teams: string[];
        groups: string[];
    }
}
