import * as React from 'react';
import { createHashRouter } from 'react-router-dom';
import { FeedbackForm } from './FeedbackForm';
import { Main } from './routes/Main';
import { TopMenu } from './TopMenu';

export const router = createHashRouter([
    {
        path: '/',
        element: <TopMenu />,
        children: [
            {
                path: '/',
                element: <Main />,
            },
            {
                path: '/new',
                element: <FeedbackForm />,
            },
        ],
    },
]);
