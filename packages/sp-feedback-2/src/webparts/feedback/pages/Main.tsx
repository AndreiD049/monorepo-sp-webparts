import * as React from 'react';
import { Outlet } from 'react-router-dom';

export const Main: React.FC = () => {
    return (
        <Outlet />
    );
}