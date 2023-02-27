import { createCacheProxy } from 'idb-proxy';
import { SPFI } from 'sp-preset';
import { IFeedbackConfig } from '../../../models/IFeedbackConfig';
import { AttachmentService } from '../../../services/attachment-service';
import { ItemsService } from '../../../services/items-service';
import { UsersService } from '../../../services/user-service';
import { DB_NAME, MINUTE, STORE_NAME } from '../constants';

export class MainService {
    private static config: IFeedbackConfig;
    public static ItemsService: ItemsService;
    public static AttachmentService: AttachmentService;
    public static UsersService: UsersService;

    public static initService(sp: SPFI, config: IFeedbackConfig): void {
        this.config = config;
        this.ItemsService = createCacheProxy(
            new ItemsService(sp, this.config.listName),
            {
                dbName: DB_NAME,
                storeName: STORE_NAME,
                prefix: 'ItemsService',
                props: {
                    getAllSystemItems: {
                        isCached: true,
                        expiresIn: MINUTE * 5,
                    },
                },
            }
        );
        this.AttachmentService = new AttachmentService(sp, config.attachmentsRoot);
        this.UsersService = new UsersService(sp);
    }
}
