import { cloneDeep } from '@microsoft/sp-lodash-subset';
import ISection from '../models/ISection';
import IUser from '../models/IUser';
import { preprocessSourceFilter } from './SourceService';

/**
 * returns true if condition is applicable
 */
const checkCondition = (value: string, conditions: string[]): boolean => {
    const valueLower = value.toLowerCase();
    const conditionsLower = conditions.map((c) => c.toLowerCase());
    return conditionsLower.indexOf(valueLower) > -1;
};

/**
 * filter single section
 */
const filterSectionSources = (section: ISection, user: IUser, team?: string): ISection => {
    section.sources = section.sources.filter((source) => {
        if (source.conditions) {
            /** Users */
            if (
                source.conditions.users?.length > 0 &&
                !checkCondition(user.Title, source.conditions.users)
            ) {
                return false;
            }
            /** Groups */
            if (
                source.conditions.groups?.length > 0 &&
                !user.groups.some((g) => checkCondition(g.Title, source.conditions.groups))
            ) {
                return false;
            }
            /** Teams */
            if (
                source.conditions.teams?.length > 0 &&
                !user.teams.some((t) => checkCondition(t, source.conditions.teams))
            ) {
                return false;
            }
            /** Role */
            if (
                source.conditions.roles?.length > 0 &&
                !checkCondition(user.role, source.conditions.roles)
            ) {
                return false;
            }
        }
        return true;
    }).map((source) => preprocessSourceFilter(source, {
        user,
        team
    }));
    return section;
};

/**
 * Receive intial sections.
 * Filter the sources based on conditions
 * Remove sections that don't have any sources at the end
 * Return filteres list of sections
 * @param sections initial sections
 * @param user currently selected user
 * @param team currently selected team
 * @returns
 */
export const filterSections = (sections: ISection[], user: IUser, team?: string): ISection[] => {
    const result = cloneDeep(sections).map((section) => filterSectionSources(section, user, team));
    return result.filter((section) => section.sources.length > 0);
};
