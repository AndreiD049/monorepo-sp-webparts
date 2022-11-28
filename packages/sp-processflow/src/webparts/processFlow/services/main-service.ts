import { CustomerFlowService, FlowLocationService, ProcessService, UserProcessService } from "@service/process-flow";
import { UserService } from "@service/users";
import { SPFI } from "sp-preset";
import { IProcessFlowConfig } from "../IProcessFlowConfig";

export class MainService {
    public static UserService: UserService = null;
    public static CustomerFlowService: CustomerFlowService = null;
    public static ProcessService: ProcessService = null;
    public static UserProcessService: UserProcessService = null;
    public static FlowLocationService: FlowLocationService = null;

    public static InitServices(options: {
        sp: SPFI,
        config: IProcessFlowConfig,
    }): void {
        this.UserService = new UserService({
            sp: options.sp,
            listName: options.config.userListName,
        });

        this.CustomerFlowService = new CustomerFlowService({
            sp: options.sp,
            listName: options.config.customerFlowListName,
        });

        this.ProcessService = new ProcessService({
            sp: options.sp,
            listName: options.config.processListName,
        });
        this.UserProcessService = new UserProcessService({
            sp: options.sp,
            listName: options.config.userProcessListName,
        });

        this.FlowLocationService = new FlowLocationService({
            sp: options.sp,
            listName: options.config.locationListName,
        })
    }
}
