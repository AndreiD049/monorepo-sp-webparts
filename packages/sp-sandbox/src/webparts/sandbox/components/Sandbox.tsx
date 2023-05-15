import * as React from 'react';
import { IDBStoreProvider, ItemSchema } from 'sp-incremental-sync';
import SandboxWebPart from '../SandboxWebPart';
import { ISandboxProps } from './ISandboxProps';

const DB_NAME = location.origin + location.pathname + '/sandbox';

type SampleItem = {
    ID: number;
    Title: string;
    Samples: number;
    Responsible: {
        ID: number;
        Title: string;
        LoginName: string;
        EMail: string;
    };
};

const schema: ItemSchema = {
    ID: {
        type: 'Integer',
        indexed: true,
    },
    Title: {
        type: 'String',
        indexed: true,
    },
    Samples: {
        type: 'Integer',
    },
    Responsible: {
        type: 'Person',
        indexed: true,
        keyPath: 'Responsible.EMail',
    },
};

export function Sandbox(props: ISandboxProps): JSX.Element {
    const [items, setItems] = React.useState<SampleItem[]>([]);
    const provider = React.useMemo(() => {
        return new IDBStoreProvider<SampleItem>({
            dbName: DB_NAME,
            list: SandboxWebPart.SPBuilder.getSP().web.lists.getByTitle(
                'Sync list'
            ),
            schema,
        });
    }, []);

    React.useEffect(() => {
        provider
            .getData()
            .then((items) => {
                setItems(items);
            })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h1>Sandbox</h1>
            <p>Web Part ID: {props.description}</p>
            <p>Web Part Title: {props.environmentMessage}</p>

            <button onClick={() => provider.forget()}>Forget</button>

            <section>
                <h2>Items</h2>

                <ul>
                    {items.map((item) => {
                        return (
                            <li key={item.ID}>
                                {item.Title} ({item.Samples}) -{' '}
                                {item.Responsible?.Title} (
                                {item.Responsible?.EMail}) - { item.Responsible?.LoginName } - { item.Responsible?.ID }
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}
