import ISource from "./ISource";
import IConfigCondition from "./IConfigCondition";
import { SectionTypes } from "./SectionTypes";

export default interface ISection {
    name: SectionTypes;
    header?: boolean;
    conditions?: IConfigCondition[];
    sources: ISource[];
}
