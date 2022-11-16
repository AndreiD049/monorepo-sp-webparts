import { ListBuilder } from "@service/process-flow";
import { IProcessFlowConfig } from "../IProcessFlowConfig";
import { IJsonConfig } from "json-configuration";
import ProcessFlowWebPart from "../ProcessFlowWebPart";
import { SPnotify } from "sp-react-notifications";
import { MessageBarType } from "office-ui-fabric-react";
import { COUNTRIES } from "./constants";

const notify = (message: string): void => {
  SPnotify({
    message,
    messageType: MessageBarType.info,
  });
};

export async function setupLists(
  config: IJsonConfig<IProcessFlowConfig>
): Promise<void> {
  const sp = ProcessFlowWebPart.SPBuilder.getSP(config.rootSite);
  const countries: string[] = COUNTRIES.map((c) => `${c.code} - ${c.name}`);
  /** Customers list */
  const customers = new ListBuilder(config.customerListName, sp, notify);
  const customersList = await customers.ensureList();
  if (customers.created) {
    await customers.addTextField({
      name: "Customer",
      description: "Name of the customer",
      indexed: true,
      required: true,
    });
    await customers.addChoiceField({
      name: "Country",
      description: "",
      choices: countries,
      type: "MultiChoice",
      indexed: false,
      required: false,
    });
    await customers.addTextField({
      name: "DBCustomers",
      description:
        "Pipe '|' separated list of customer codes as they are created in the database",
      indexed: false,
      required: false,
    });
    await customers.createView();
  }

  console.log(customersList);

  /** Process flow list */
  const processFlow = new ListBuilder(config.listName, sp, notify);
  await processFlow.ensureList();
  if (processFlow.created) {
    await processFlow.addChoiceField({
      name: "System",
      description: "Where the procedure is performed",
      choices: ["PLATO", "SAP", "PLATO/SAP"],
      type: "Choice",
      indexed: true,
      required: false,
    });
    await processFlow.addChoiceField({
      name: "Procedure",
      description: "Procedure name",
      choices: ["NA"],
      type: "Choice",
      indexed: true,
      required: false,
    });
    await processFlow.addChoiceField({
      name: "Sites",
      description: "Sites where procedure is performed",
      choices: ["NA", "LB1227", "WVN", "119"],
      type: "MultiChoice",
      indexed: true,
      required: false,
    });
    await processFlow.addChoiceField({
      name: "DoneBy",
      description: "Which party does the procedure",
      choices: ["All", "MOL", "BE", "SITE"],
      type: "MultiChoice",
      indexed: true,
      required: false,
    });
    await processFlow.addChoiceField({
      name: "Category",
      description: "",
      choices: [
        "Inbound",
        "Outbound",
        "Manipulation",
        "Invoicing",
        "Miscellaneous",
        "SAP",
      ],
      type: "Choice",
      indexed: true,
      required: false,
    });
    await processFlow.addChoiceField({
      name: "Country",
      description: "",
      choices: ["All", ...countries],
      type: "MultiChoice",
      indexed: false,
      required: false,
    });
    await processFlow.addLookupField({
      name: "Customer",
      description: "Customer for which the procedure is done",
      required: false,
      indexed: true,
      ListId: customersList.Id,
      LookupColumn: "Customer",
      type: "Lookup",
    });
    await processFlow.addDateField({
      name: "Date",
      description: "Date when training was done",
      format: "DateOnly",
      indexed: true,
      required: false,
    });
    await processFlow.addUserField({
      name: "User",
      description: "User who does the procedure",
      indexed: true,
      required: true,
    });
    await processFlow.addChoiceField({
      name: "State",
      description: "",
      choices: ["NA", "Planned", "On-going", "Completed"],
      type: "Choice",
      indexed: true,
      required: false,
    });
    await processFlow.addNumberField({
      name: "Allocations",
      description: "How many minutes per UOM the task requires",
      min: 0,
    });
    await processFlow.addChoiceField({
      name: "UOM",
      description: "",
      choices: ["Order", "Day", "Week", "Month"],
      type: "Choice",
      indexed: false,
      required: false,
    });
    await processFlow.createView();
  }
}
