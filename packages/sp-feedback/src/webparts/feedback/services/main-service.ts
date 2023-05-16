import { SPFI } from 'sp-preset';
import { IFeedbackConfig } from '../../../models/IFeedbackConfig';
import { AttachmentService } from '../../../services/attachment-service';
import { ItemsService } from '../../../services/items-service';
import { TempItemsService } from '../../../services/temp-items-service';
import { UsersService } from '../../../services/user-service';
import { IDBStoreProvider } from 'sp-incremental-sync';
import { IFeedbackItemRaw } from '../../../models/IFeedbackItem';
import { getSyncProvider } from '../../../features/incremental-sync';

export class MainService {
    private static config: IFeedbackConfig;
    public static ItemsService: ItemsService;
    public static TempItemService: TempItemsService;
    public static AttachmentService: AttachmentService;
    public static UsersService: UsersService;
    public static SyncProvider: IDBStoreProvider<IFeedbackItemRaw>;

    public static initService(sp: SPFI, config: IFeedbackConfig): void {
        if (!config) return null;
        this.config = config;
        this.ItemsService = new ItemsService(sp, this.config.listName);
        this.TempItemService = new TempItemsService();
        this.AttachmentService = new AttachmentService(sp, config.attachmentsRoot);
        this.UsersService = new UsersService(sp);
        this.SyncProvider = getSyncProvider(sp.web.lists.getByTitle(config.listName));
    }
}
