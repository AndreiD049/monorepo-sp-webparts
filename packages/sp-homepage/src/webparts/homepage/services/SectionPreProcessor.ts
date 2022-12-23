import { uniq } from '@microsoft/sp-lodash-subset';
import { DateTime } from 'luxon';
import ISection from '../models/ISection';
import IConfigCondition, { ConditionKey } from '../models/IConfigCondition';
import IUser from '../models/IUser';
import { SPnotify } from 'sp-react-notifications';

export interface IPreProcessorContext {
    currentUser: IUser;
    selectedUser: IUser;
    selectedTeam: string;
}

/** Placeholders that can be used in source filters */
const tagMap: { [key: string]: (ctx: IPreProcessorContext) => string } = {
    '@me': (context: IPreProcessorContext) => context.currentUser.Email,
    '@selectedUserId': (context: IPreProcessorContext) => context.selectedUser.Id.toString(),
    '@selectedTeam': (context: IPreProcessorContext) => context.selectedTeam,
    '@today': (_context: IPreProcessorContext) => DateTime.now().toISODate(),
    '@monday': (_context: IPreProcessorContext) => DateTime.now().set({ weekday: 1 }).toISODate(),
    '@tuesday': (_context: IPreProcessorContext) => DateTime.now().set({ weekday: 2 }).toISODate(),
    '@wednesday': (_context: IPreProcessorContext) =>
        DateTime.now().set({ weekday: 3 }).toISODate(),
    '@thursday': (_context: IPreProcessorContext) => DateTime.now().set({ weekday: 4 }).toISODate(),
    '@friday': (_context: IPreProcessorContext) => DateTime.now().set({ weekday: 5 }).toISODate(),
    '@startOfMonth': (_context: IPreProcessorContext) =>
        DateTime.now().startOf('month').toISODate(),
    '@endOfMonth': (_context: IPreProcessorContext) => DateTime.now().endOf('month').toISODate(),
};

export class SectionPreProcessor {
    private static placeholderRe = /@\w+/g;

    constructor(private context: IPreProcessorContext) {}

    preProcessConditions(section: ISection): ISection {
        if (section.conditions?.length) {
            section.conditions = section.conditions.map((c) => this.preProcessCondition(c));
        }
        section.sources = section.sources.map((source) => {
            if (source.conditions) {
                source.conditions = source.conditions.map((c) => this.preProcessCondition(c));
            }
            return source;
        });
        return section;
    }

    preProcessFilters(section: ISection): ISection {
        section.sources = section.sources.map((source) => {
            source.filter = this.preProcessText(source.filter);
            return source;
        });
        return section;
    }

    preProcessOptions(section: ISection): ISection {
        if (!section.options) {
            section.options = [];
            return section;
        }
        section.options = section.options.map((opt) => opt.toLowerCase());
        return section;
    }

    private preProcessCondition(condition: IConfigCondition): IConfigCondition {
        if (condition.current) {
            const keys = Object.keys(condition.current) as ConditionKey[];
            keys.forEach((k) => {
                const value = condition.current[k];
                if (typeof value === 'string') {
                    condition.current[k] = this.preProcessText(value) as string & string[];
                } else {
                    condition.current[k] = value.map((v) => this.preProcessText(v)) as string & string[];
                }
            });
        }
        if (condition.selected) {
            const keys = Object.keys(condition.selected) as ConditionKey[];
            keys.forEach((k) => {
                const value = condition.selected[k];
                if (typeof value === 'string') {
                    condition.selected[k] = this.preProcessText(value) as string & string[];
                } else {
                    condition.selected[k] = value.map((v) => this.preProcessText(v)) as string & string[];
                }
            });
        }
        return condition;
    }

    private preProcessText(text: string): string {
        if (!this.hasPlaceholders(text)) {
            return text;
        }
        let result = text;
        const tags = this.getTags(text);
        tags.forEach((tag) => {
            if (!(tag in tagMap)) {
                this.error(`Unknwon tag '${tag}'`);
            }
            result = result.replaceAll(tag, tagMap[tag](this.context));
        })
        return result;
    }

    private hasPlaceholders(text: string): boolean {
        return SectionPreProcessor.placeholderRe.test(text);
    }

    private getTags(text: string): string[] {
        return uniq(text.match(SectionPreProcessor.placeholderRe));
    }

    private error(message: string): void {
        SPnotify({
            message,
            messageType: 1,
        });
        throw Error(message);
    }
}
