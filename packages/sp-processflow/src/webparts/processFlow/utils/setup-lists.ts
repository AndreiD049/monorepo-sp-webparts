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
  const countries: string[] = COUNTRIES.map((c) => `${c.name} - ${c.code}`);
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
      name: "CustomerGroup",
      type: "Choice",
      choices: [],
      allowFillIn: true,
      indexed: false,
      required: false,
    });
    await customers.addChoiceField({
      name: "DBCustomers",
      description: "Customer codes as they are created in the database",
      type: "MultiChoice",
      choices: [],
      allowFillIn: true,
      indexed: false,
      required: false,
    });
    await customers.addTextField({
        name: "Team",
        description: "Team that is handling this customer",
        indexed: true,
        required: true,
    });
    await customers.createView();
  }

  /** Procedure list */
  const procedure = new ListBuilder(config.procedureListName, sp, notify);
  const procedureList = await procedure.ensureList();
  if (procedure.created) {
    await procedure.addChoiceField({
      name: "System",
      description: "Where the procedure is performed",
      type: "Choice",
      choices: ["PLATO", "SAP", "PLATO/SAP"],
      indexed: true,
      required: true,
    });
    await procedure.addTextField({
      name: "Procedure",
      description: "Name of the procedure",
      indexed: true,
      required: true,
    });
    await procedure.addChoiceField({
      name: "Category",
      type: "Choice",
      choices: ["Inbound", "Outbound", "Manipulation", "Other"],
      indexed: true,
      required: true,
    });
    await procedure.addLookupField({
      name: "Customer",
      ListId: customersList.Id,
      LookupColumn: "Customer",
      required: false,
      indexed: true,
      type: "Lookup",
    });
    await procedure.addChoiceField({
      name: "Manuals",
      description: "Manual links",
      type: "MultiChoice",
      allowFillIn: true,
      choices: [],
    });
    await procedure.addTextField({
      name: "ProcedureOptions",
      description: "Service only field. Leave empty. Only for storing the options.",
      indexed: false,
      required: false,
    });
    await procedure.createView();
  }

  /** Process flow list */
  const userProcedure = new ListBuilder(
    config.userProcedureListName,
    sp,
    notify
  );
  await userProcedure.ensureList();
  if (userProcedure.created) {
    await userProcedure.addLookupField({
      name: "Customer",
      ListId: customersList.Id,
      LookupColumn: "Customer",
      required: false,
      indexed: true,
      type: "Lookup",
    });
    await userProcedure.addLookupField({
      name: "Procedure",
      ListId: procedureList.Id,
      LookupColumn: "Procedure",
      type: "Lookup",
      indexed: false,
      required: true,
    });
    await userProcedure.addDateField({
      name: "Date",
      description: "Date of the next action. depends on status",
      format: "DateOnly",
      required: false,
      indexed: false,
    });
    await userProcedure.addUserField({
      name: "User",
      description: "User who does the procedure",
      indexed: true,
      required: true,
    });
    await userProcedure.addChoiceField({
      name: "Status",
      description: "",
      choices: ["NA", "Planned", "On-going", "Completed"],
      type: "Choice",
      indexed: true,
      required: false,
    });
    await userProcedure.addChoiceField({
      name: "Team",
      type: "Choice",
      choices: ["NA"],
      allowFillIn: true,
      required: false,
      indexed: true,
    });
    await userProcedure.addNumberField({
      name: "Allocations",
      description: "How many minutes per UOM the task requires",
      min: 0,
    });
    await userProcedure.addChoiceField({
      name: "UOM",
      description: "",
      choices: ["Order", "Day", "Week", "Month"],
      type: "Choice",
      indexed: false,
      required: false,
    });
    await userProcedure.createView();
  }

  const location = new ListBuilder(config.locationListName, sp, notify);
  await location.ensureList();
  if (location.created) {
    await location.addLookupField({
      name: "Customer",
      ListId: customersList.Id,
      LookupColumn: "Customer",
      required: false,
      indexed: true,
      type: "Lookup",
    });
    await location.addLookupField({
      name: "Procedure",
      ListId: procedureList.Id,
      LookupColumn: "Procedure",
      type: "Lookup",
      indexed: false,
      required: true,
    });
    await location.addChoiceField({
      name: "Location",
      description: "Location where procedure is done",
      type: "Choice",
      choices: [],
    });
    await location.addChoiceField({
      name: "Country",
      description: "Country where procedure is done",
      type: "MultiChoice",
      choices: countries,
    });
    await location.addChoiceField({
      name: "DoneBy",
      description: "Party that performs the procedure",
      type: "MultiChoice",
      choices: ["MOL", "COL", "Site"],
      indexed: false,
      required: false,
    });
    await location.createView();
  }
}
