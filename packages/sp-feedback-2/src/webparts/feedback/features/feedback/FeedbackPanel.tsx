import { Panel, PanelType } from 'office-ui-fabric-react';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeedbackDetails } from '../../components/FeedbackDetails';

export const FeedbackPanel: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const id = searchParams.get('feedback');

    if (id === null) {
        return null;
    }

    if (isNaN(+id)) {
        return null;
    }

	const onDismiss = (): void => {
		setSearchParams((prev) => {
			prev.delete('feedback');
			prev.delete('blocking');
			return prev;
		});
	};

    return (
        <Panel
            isOpen={true}
			isLightDismiss={true}
			type={PanelType.large}
            onDismiss={onDismiss}
			styles={{
				commands: {
					display: 'none',
				},
				content: {
					padding: 0,
				}
			}}
        >
			<FeedbackDetails feedbackId={parseInt(id)} onDismiss={onDismiss} />
        </Panel>
    );
};
