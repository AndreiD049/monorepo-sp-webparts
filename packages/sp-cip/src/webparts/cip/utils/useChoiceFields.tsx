import * as React from 'react';
import { Caching, IFieldInfo } from 'sp-preset';
import CipWebPart from '../CipWebPart';
import { ITask } from '../tasks/ITask';
import { GlobalContext } from './GlobalContext';

export const useChoiceFields = (fieldName: keyof ITask) => {
    const ctx = React.useContext(GlobalContext);
    const sp = React.useMemo(
        () => CipWebPart.SPBuilder.getSP('Data').using(Caching()),
        []
    );
    const list = React.useMemo(
        () => sp.web.lists.getByTitle(ctx.properties.tasksListName),
        [sp]
    );
    const [fieldInfo, setFieldInfo] = React.useState<IFieldInfo>(null);

    React.useEffect(() => {
        async function run() {
            const field: any = await list.fields.getByTitle(fieldName)();
            setFieldInfo(field);
        }
        run();
    }, []);

    return {
        fieldInfo,
    };
};
