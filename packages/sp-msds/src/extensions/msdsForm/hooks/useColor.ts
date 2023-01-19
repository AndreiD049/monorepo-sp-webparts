import * as React from 'react';
import { LookupServiceCached } from '../services/lookup-service';
import { ITagWithData, LookupOptions } from './types';

export function useColors(): LookupOptions<string> {
    const [colors, setColors] = React.useState<string[]>([]);
    const colorTags: ITagWithData<string>[] = React.useMemo(() => {
        return colors.map((color) => ({
            name: color,
            key: color,
            data: color,
        }));
    }, [colors]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setColors(await LookupServiceCached.getAllColors());
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: colors,
        set: setColors,
        tags: colorTags,
    };
}
