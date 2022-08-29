import ISource from "./ISource";
import { SectionTypes } from "./SectionTypes";

export default interface ISection {
    name: SectionTypes;
    header?: boolean;
    sources: ISource[];
}
