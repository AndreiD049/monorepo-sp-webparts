import { createCacheProxy } from "idb-proxy";
import { IList, SPFI } from "sp-preset";
import { DB_NAME, HOUR, STORE_NAME } from "../constants";

export interface ICustomer {
    Id: number;
    Title: string;
    Name: string;
}

export interface IDatabase {
    Id: number;
    Title: string;
}

export class LookupService {
    private static sp: SPFI;
    private static applicationList: IList;
    private static customerList: IList;
    private static databaseList: IList;

    public static InitService(sp: SPFI): void {
        this.sp = sp;
        this.applicationList = this.sp.web.lists.getByTitle("Web application form");
        this.customerList = this.sp.web.lists.getByTitle("Customers");
        this.databaseList = this.sp.web.lists.getByTitle("Databases");
    }     

    public static async getAllCustomers(top: number = 300): Promise<ICustomer[]> {
        return this.customerList.items.select("Id,Title,Name").top(top)();
    }

    public static async getCustomerFilter(filter: string): Promise<ICustomer[]> {
        return this.customerList.items.select("Id,Title,Name").filter(`substringof('${filter}', Title)`)();
    }

    public static async getAllDatabases(): Promise<IDatabase[]> {
        return this.databaseList.items.select('Id,Title')();
    }

    public static async getDatabases(site: string): Promise<IDatabase[]> {
        return this.databaseList.items.filter(`Sites eq '${site}'`).select('Id,Title')();
    }

    public static async getAllSites(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle("Site")()).Choices;
    }

    public static async getAllFormShapes(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle("Form or Shape")()).Choices;
    }

    public static async getAllColors(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle("Color")()).Choices;
    }

    public static async getAllWarehouseTypes(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle("Warehouse type")()).Choices;
    }

    public static async getAllProductTypes(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle("Product type")()).Choices;
    }

    public static async getAllHazardousGoodsCode(): Promise<string[]> {
        return (await this.applicationList.fields.getByTitle("HAZARDOUS GOODS products code")()).Choices;
    }
}

export const LookupServiceCached = createCacheProxy(LookupService, {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'LookupService',
    props: {
        'getAllCustomers|getAllDatabases|getAllSites|getAllFormShapes|getAllColors|getAllWarehouseTypes|getAllHazardousGoodsCode': {
            isCached: true,
            expiresIn: HOUR * 8,
            isPattern: true,
        },
    }
});