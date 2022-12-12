import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { hidePanel, showPanel } from 'sp-components';
import { MainService } from '../../services/main-service';
import { MAIN_PANEL } from '../../utils/constants';

export interface IProcessDetailsProps {
    // Props go here
}

const Details: React.FC<{ processId: number }> = (props) => {
    const { ProcessService } = MainService;
    const [process, setProcess] = React.useState(null);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (Number.isInteger(props.processId)) {
                setProcess(await ProcessService.getById(+props.processId));
            }
        }
        run().catch((err) => console.error(err));
    }, [props.processId]);

    if (!process) return null;

    return <div>{process.Title}</div>;
};

export const ProcessDetails: React.FC<IProcessDetailsProps> = (props) => {
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const navigate = useNavigate();

    React.useEffect(() => {
        showPanel(
            MAIN_PANEL,
            {
                headerText: 'Process details',
                onDismiss: () => {
                    navigate(`/?${searchParams.toString()}`);
                    hidePanel(MAIN_PANEL);
                },
            },
            <Details processId={+id} />
        );
    }, [id]);

    return null;
};
