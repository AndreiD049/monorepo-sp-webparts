import { UserService } from "@service/users";
import { SPFI } from "sp-preset";
import { IProcessFlowConfig } from "../IProcessFlowConfig";

export class MainService {
    public static UserService: UserService = null;

    public static InitServices(options: {
        sp: SPFI,
        config: IProcessFlowConfig,
    }) {
        this.UserService = new UserService({
            sp: options.sp,
            listName: options.config.userListName,
        });
    }
}
