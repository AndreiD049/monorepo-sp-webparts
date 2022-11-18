import * as React from "react";
import ProcessFlowWebPart, {
  IProcessFlowWebPartProps,
} from "../ProcessFlowWebPart";
import { Header } from "./Header";
import { IUser, UserService } from "@service/users";
import styles from "./ProcessFlow.module.scss";
import { MainService } from "../services/main-service";
import { db } from "../utils/cache";
import { Text } from "office-ui-fabric-react";

export interface IProcessFlowProps {
  properties: IProcessFlowWebPartProps;
}

interface ICustomerTeam {
    Customer: string;
    CustomerGroup: string;
    DBCustomers: string[];
    Team: string;
}

export const ProcessFlow: React.FC<IProcessFlowProps> = (props) => {
  const service = MainService.UserService;
  const [currentUser, setCurrentUser] = React.useState<IUser>(null);
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [customers, setCustomers] = React.useState<ICustomerTeam[]>([]);

  // Get current user
  React.useEffect(() => {
    async function run(): Promise<void> {
      const current = await db.getCached("current", () =>
        service.getCurrentUser()
      );
      if (!current) {
        await db.invalidateCached("current");
        console.error(`Couldn't fetch current user info`);
      }
      setCurrentUser(current);
    }
    run().catch((err) => console.error(err));
  }, []);

  // Team selected
  React.useEffect(() => {
    async function run() {
        if (selectedTeam) {
            const sp = ProcessFlowWebPart.SPBuilder.getSP();
            const list = sp.web.lists.getByTitle(props.properties.config.customerListName);
            setCustomers(await list.items.filter(`Team eq '${selectedTeam}'`)());
        }
    }
    run().catch((err) => console.error(err));
  }, [selectedTeam]);

  if (!currentUser) return null;

    console.log(selectedTeam);

  return (
    <div className={styles.processFlow}>
      <Header />
      <Text variant="medium">{currentUser.Title}</Text>
      <div>
        <label htmlFor="team">Select team: </label>
        <select value={selectedTeam} id="team" onChange={(ev) => setSelectedTeam(ev.target.value)}>
          <option value="" />
          {currentUser.ListInfo.Teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>
      <div>
        {
            customers.map((c) => ( <div>{c.Customer} - {c.Team}</div>))
        }
      </div>
    </div>
  );
};
