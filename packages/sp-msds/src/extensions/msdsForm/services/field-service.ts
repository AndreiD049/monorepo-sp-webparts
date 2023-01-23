import { createCacheProxy } from "idb-proxy";
import { IList, SPFI } from "sp-preset";
import { DB_NAME, HOUR, STORE_NAME } from "../constants";
import { IMSDSFields } from "./IMSDSFields";

export class FieldService {
    private static sp: SPFI;
    private static fieldList: IList;

    public static InitService(sp: SPFI): void {
        this.sp = sp;
        this.fieldList = this.sp.web.lists.getByTitle("Application form fields");
    }
    
    public static async getFields(site: string): Promise<IMSDSFields[]> {
        return this.fieldList.items.filter(`Site eq '${site}'`)();
    }
}

export const FieldServiceCached = createCacheProxy(FieldService, {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'FieldService',
    props: {
        'getFields': {
            isCached: true,
            expiresIn: HOUR * 8,
            isPattern: true,
        },
    }
});