import * as React from 'react';
import { IDBStoreProvider, ItemSchema } from 'sp-incremental-sync';
import SandboxWebPart from '../SandboxWebPart';
import { ISandboxProps } from './ISandboxProps';

const DB_NAME = location.origin + location.pathname + '/sandbox';

type SampleItem = {
    ID: number;
    Title: string;
    Samples: number;
    Data: string;
    MultiData: string[];
    Archived: boolean;
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
    Data: {
        type: 'String',
        indexed: true,
    },
    MultiData: {
        type: 'MultiChoice',
        indexed: true,
    },
    Archived: {
        type: 'Boolean',
    }
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

    const onSearch = async (): Promise<void> => {
        const input = document.getElementById('where') as HTMLTextAreaElement;
        if (!input) return;

        const where = input.value;

        provider.updateConfig({
            where,
        });
        const items = await provider.getData();
        setItems(items);
    };

    return (
        <div>
            <h1>Sandbox</h1>
            <p>Web Part ID: {props.description}</p>
            <p>Web Part Title: {props.environmentMessage}</p>

            <button onClick={() => provider.forget()}>Forget</button>

            <section>
                <h2>Items</h2>

                <textarea id="where" placeholder="Where" />
                <button onClick={onSearch}>Search</button>

                <ul>
                    {items.map((item) => {
                        return (
                            <li key={item.ID}>
                                <p>ID: {item.ID}</p>
                                <p>Title: {item.Title}</p>
                                <p>Samples: {item.Samples}</p>
                                <p>Data: {item.Data}</p>
                                <div>
                                    <p>Responsible:</p>
                                    <p style={{ marginLeft: 10 }}>
                                        ID: {item.Responsible?.ID}
                                    </p>
                                    <p style={{ marginLeft: 10 }}>
                                        Title: {item.Responsible?.Title}
                                    </p>
                                    <p style={{ marginLeft: 10 }}>
                                        EMail: {item.Responsible?.EMail}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}
