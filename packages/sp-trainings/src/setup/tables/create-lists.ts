import ensureFieldsSessions from './sessions-list';
import ensureFieldsTrainings from './trainings-list';
import { SPFI } from "sp-preset";
import { ensureList } from './ensure-list'

export async function createTables(
    sp: SPFI,
    /** hygen-lists */
    sessionsListTitle: string,
    trainingsListTitle: string,
) {
    /** hygen-lists-creation */
    const sessionsList = await ensureList(sessionsListTitle, sp);
    await ensureFieldsSessions(sessionsList);
    const trainingsList = await ensureList(trainingsListTitle, sp);
    await ensureFieldsTrainings(trainingsList);
}