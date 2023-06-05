import * as React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';

const hashRouter = createHashRouter([
    {
        path: '/',
        element: <div>test</div>,
    }
]);

export const Router: React.FC = () => {
    return <RouterProvider router={hashRouter} />
};