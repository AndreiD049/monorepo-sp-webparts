import * as React from 'react';
import { LookupServiceCached } from '../services/lookup-service';
import { ITagWithData, LookupOptions } from './types';

export function useFormShape(): LookupOptions<string> {
    const [formShape, setFormShape] = React.useState<string[]>([]);
    const formShapeTags: ITagWithData<string>[] = React.useMemo(() => {
        return formShape.map((form) => ({
            name: form,
            key: form,
            data: form,
        }));
    }, [formShape]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setFormShape(await LookupServiceCached.getAllFormShapes());
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: formShape,
        set: setFormShape,
        tags: formShapeTags,
    };
}
