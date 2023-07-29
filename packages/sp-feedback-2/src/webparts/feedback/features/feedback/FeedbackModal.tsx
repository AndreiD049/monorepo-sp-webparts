import { Modal } from 'office-ui-fabric-react';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeedbackDetails } from '../../components/FeedbackDetails';

export const FeedbackModal: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const id = searchParams.get('feedback');
	const blocking = searchParams.get('blocking') === 'true';

    if (id === null) {
        return null;
    }

    if (isNaN(+id)) {
        return null;
    }

	const onDismiss = () => {
		setSearchParams((prev) => {
			prev.delete('feedback');
			prev.delete('blocking');
			return prev;
		});
	};

    return (
        <Modal
            isOpen={true}
			isBlocking={blocking}
            onDismiss={onDismiss}
            styles={{
                main: {
					minWidth: '95vw',
					minHeight: '95vh',
					overflow: 'hidden',
					border: '1px solid lightgray',
                },
				scrollableContent: {
					overflow: 'hidden',
				}
            }}
        >
			<FeedbackDetails feedbackId={parseInt(id)} onDismiss={onDismiss} />
        </Modal>
    );
};
