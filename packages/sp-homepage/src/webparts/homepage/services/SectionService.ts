import { cloneDeep } from '@microsoft/sp-lodash-subset';
import ISection from '../models/ISection';
import { ConditionChecker } from './ConditionChecker';
import { SectionPreProcessor } from './SectionPreProcessor';

/**
 * filter single section
 */
const filterSectionSources = (section: ISection, checker: ConditionChecker): ISection => {
    section.sources = section.sources.filter((source) => {
        if (source.conditions) {
            const checkedConditions = checker.checkConditions(source.conditions);
            if (!checkedConditions) return false;
        }
        return true;
    });
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
export const filterSections = (
    sections: ISection[],
    checker: ConditionChecker,
    preProcessor: SectionPreProcessor
): ISection[] => {
    const result = cloneDeep(sections)
        .map((section) => preProcessor.preProcessConditions(section))
        .filter((section) => checker.checkConditions(section.conditions))
        .map((section) => filterSectionSources(section, checker))
        .filter((section) => section.sources.length > 0)
        .map((section) => preProcessor.preProcessFilters(section));
    return result.filter((section) => section.sources.length > 0);
};
