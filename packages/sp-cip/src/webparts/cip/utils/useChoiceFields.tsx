import * as React from 'react';
import { Caching, IFieldInfo, SPFI } from 'sp-preset';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import CipWebPart from '../CipWebPart';
import { GlobalContext } from './GlobalContext';

export const useChoiceFields = (fieldName: keyof ITaskOverview, customSP?: SPFI): { fieldInfo: IFieldInfo } => {
    const ctx = React.useContext(GlobalContext);
    const sp = customSP || React.useMemo(
        () => CipWebPart.SPBuilder.getSP('Data').using(Caching()),
        []
    );
    const list = React.useMemo(
        () => sp.web.lists.getByTitle(ctx.properties.config.listName),
        [sp]
    );
    const [fieldInfo, setFieldInfo] = React.useState<IFieldInfo>(null);

    React.useEffect(() => {
        async function run(): Promise<void> {
            const field: IFieldInfo = await list.fields.getByTitle(fieldName)();
            setFieldInfo(field);
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        fieldInfo,
    };
};
