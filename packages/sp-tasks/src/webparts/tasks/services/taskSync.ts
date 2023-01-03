import { DateTime } from "luxon";
import { IList, SPFI } from "sp-preset";
import { processChangeResult } from "../utils/utils";

interface ITaskSyncProps {
    sp: SPFI,
    listName: string;
}

export class TaskSync {
    private sp: SPFI;
    private listName: string;
    private list: IList;
    public lastToken: string;

    constructor(options: ITaskSyncProps) {
        this.sp = options.sp;
        this.listName = options.listName;
        this.list = this.sp.web.lists.getByTitle(this.listName);
    }

    async didRecordsChangedOnDate(date: Date, userIds: number[]): Promise<boolean> {
        const dt = DateTime.fromJSDate(date).toISODate();
        const values = userIds.map(id => `<Value Type='User'>${id}</Value>)`);
        const result = await this.list.getListItemChangesSinceToken({
                RowLimit: '1',
                Query: `<Where>
                    <And>
                        <In>
                            <FieldRef Name='User' LookupId='TRUE'/>
                            <Values>
                                ${values}
                            </Values>
                        </In>
                        <Eq>
                            <FieldRef Name='Date'/>
                            <Value Type='Date'>${dt}</Value>
                        </Eq>
                    </And>
                </Where>`,
                ChangeToken: this.lastToken,
            });
        return processChangeResult(result, this);
    }

    async didRecordsChanged(userIds: number[]): Promise<boolean> {
        const values = userIds.map(id => `<Value Type='User'>${id}</Value>`).join();
        const result = await this.list.getListItemChangesSinceToken({
            RowLimit: '1',
            Query: 
            `<Where>
                <In>
                    <FieldRef Name='AssignedTo' LookupId='TRUE'/>
                    <Values>
                        ${values}
                    </Values>
                </In>
            </Where>`,
            ChangeToken: this.lastToken,
        });
        return processChangeResult(result, this);
    }
}