import { SPFI } from 'sp-preset';
import { IFeedbackConfig } from '../../../models/IFeedbackConfig';
import { ItemsService } from '../../../services/items-service';

export class MainService {
    private static config: IFeedbackConfig;
    public static ItemsService: ItemsService;

    public static initService(sp: SPFI, config: IFeedbackConfig): void {
        this.config = config;
        this.ItemsService = new ItemsService(sp, this.config.listName);
        // this.ItemsService = createCacheProxy(
        //     new ItemsService(sp, this.config.listName),
        //     {
        //         dbName: DB_NAME,
        //         storeName: STORE_NAME,
        //         prefix: 'ItemsService',
        //         props: {
        //             getAllItems: {
        //                 isCached: true,
        //                 expiresIn: MINUTE * 5,
        //             },
        //         },
        //     }
        // );
    }
}
