import * as React from "react";
import styles from "./TestProject.module.scss";
import { ITestProjectProps } from "./ITestProjectProps";
import TestProjectWebPart from "../TestProjectWebPart";
import { IndexedDBCacher } from "sp-indexeddb-caching";

const TestProject: React.FC<ITestProjectProps> = (props) => {
  const [lists, setLists] = React.useState([]);
  const [forceReload, setForceReload] = React.useState(false);
  const { Cache, CachingTimeline } = IndexedDBCacher({
    keyFactory: (url) => url,
  });
  const sp = TestProjectWebPart.spBuilder.getSP().using(CachingTimeline);

  React.useEffect(() => {
    (async function run() {
      setLists(await sp.web.lists());
    })();
  }, [forceReload]);

  const handleClearCache = async () => {
    console.log(TestProjectWebPart.baseUrl + sp.web.lists.toRequestUrl());
    Cache.getFromParts(TestProjectWebPart.baseUrl, sp.web.lists.toRequestUrl()).remove();
    setForceReload(prev => !prev);
  }

  const handleAddDummyList = async () => {
    const lists = Cache.getFromParts(TestProjectWebPart.baseUrl, sp.web.lists.toRequestUrl());
    console.log('lists', lists);
    await lists.set((prev: any[]) => [{ Title: 'My dummy list' }]);
    setForceReload(prev => !prev);
  }

  return (
    <section className={`${styles.testProject}`}>
      <div className={styles.welcome}></div>
      <div>
        <h3>Welcome to SharePoint Framework!</h3>
        <p>
          The SharePoint Framework (SPFx) is a extensibility model for Microsoft
          Viva, Microsoft Teams and SharePoint. It's the easiest way to extend
          Microsoft 365 with automatic Single Sign On, automatic hosting and
          industry standard tooling.
        </p>
        <h4>Learn more about SPFx development:</h4>
        <button onClick={handleClearCache}>Clear cache</button>
        <button onClick={handleAddDummyList}>Add dummy list</button>
        <ul>
          {
            lists.map((list) => (<li>{list.Title}</li>))
          }
        </ul>
      </div>
    </section>
  );
};

export default TestProject;
