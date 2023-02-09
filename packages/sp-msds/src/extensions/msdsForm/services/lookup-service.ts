import { uniq } from '@microsoft/sp-lodash-subset';
import { createCacheProxy } from 'idb-proxy';
import { IList, ISiteUserInfo, SPFI } from 'sp-preset';
import { DB_NAME, HOUR, STORE_NAME } from '../constants';
import { IMsdsFormFormCustomizerProperties } from '../MsdsFormFormCustomizer';

export interface ICustomer {
    Id: number;
    Title: string;
    Name: string;
}

export interface IApprovers {
    HSEQresponsable: {
        Id: number;
        Title: string;
        EMail: string;
    }[];
    Location: string[];
}

export class LookupService {
    private static sp: SPFI;
    private static applicationList: IList;
    private static customerList: IList;
    private static approversList: IList;

    public static InitService(
        sp: SPFI,
        properties: IMsdsFormFormCustomizerProperties
    ): void {
        this.sp = sp;
        this.applicationList = this.sp.web.lists.getByTitle(
            'Web application form'
        );
        this.customerList = this.sp.web.lists.getByTitle('Customers');
        this.approversList = this.sp.web.lists.getByTitle(
            properties.approverListName
        );
    }

    public static async getCurrentUser(): Promise<ISiteUserInfo> {
        return this.sp.web.currentUser();
    }

    public static async getCustomer(id: number): Promise<ICustomer> {
        return this.customerList.items.getById(id).select('Id,Title,Name')();
    }

    public static async getAllCustomers(
        top: number = 300
    ): Promise<ICustomer[]> {
        return this.customerList.items.select('Id,Title,Name').top(top)();
    }

    public static async getCustomerFilter(
        filter: string
    ): Promise<ICustomer[]> {
        return this.customerList.items
            .select('Id,Title,Name')
            .filter(`substringof('${filter}', Title)`)();
    }

    public static async getAllDatabases(): Promise<string[]> {
        const items: { Database: string }[] = await this.approversList.items.select('Database')();
        return uniq(items.map((i) => i.Database));
    }

    public static async getDatabases(site: string): Promise<string[]> {
        const dbs: { Database: string }[] = await this.approversList.items
            .filter(`Location eq '${site}'`)
            .select('Id,Database')();
        return uniq(dbs.map((i) => i.Database));
    }

    public static async getAllSites(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle('Site')()).Choices;
    }

    public static async getAllFormShapes(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle('Form or Shape')())
            .Choices;
    }

    public static async getAllColors(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle('Color')())
            .Choices;
    }

    public static async getAllWarehouseTypes(): Promise<string[]> {
        return (
            await this.applicationList.fields.getByTitle('Warehouse type')()
        ).Choices;
    }

    public static async getAllProductTypes(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle('Product type')())
            .Choices;
    }

    public static async getAllHazardousGoodsCode(): Promise<string[]> {
        return (
            await this.applicationList.fields.getByTitle(
                'HAZARDOUS GOODS products code'
            )()
        ).Choices;
    }

    public static async getApproversByLocation(
        site: string
    ): Promise<IApprovers[]> {
        return this.approversList.items
            .filter(`Location eq '${site}'`)
            .select('HSEQresponsable/Id,HSEQresponsable/Title,HSEQresponsable/EMail,Location')
            .expand('HSEQresponsable')();
    }

    public static async getSiteUsers(): Promise<ISiteUserInfo[]> {
        return this.sp.web.siteUsers();
    }
}

export const LookupServiceCached = createCacheProxy(LookupService, {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'LookupService',
    props: {
        'getSiteUsers|getCurrentUser|getAllCustomers|getCustomer|getAllDatabases|getAllSites|getAllFormShapes|getAllColors|getAllWarehouseTypes|getAllHazardousGoodsCode':
            {
                isCached: true,
                expiresIn: HOUR,
                isPattern: true,
            },
    },
});
