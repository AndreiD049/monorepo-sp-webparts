import { CustomerFlowService } from "@service/process-flow";
import { UserService } from "@service/users";
import { SPFI } from "sp-preset";
import { IProcessFlowConfig } from "../IProcessFlowConfig";

export class MainService {
    public static UserService: UserService = null;
    public static CustomerFlowService: CustomerFlowService = null;

    public static InitServices(options: {
        sp: SPFI,
        config: IProcessFlowConfig,
    }) {
        this.UserService = new UserService({
            sp: options.sp,
            listName: options.config.userListName,
        });

        this.CustomerFlowService = new CustomerFlowService({
            sp: options.sp,
            listName: options.config.customerFlowListName,
        });
    }
}
