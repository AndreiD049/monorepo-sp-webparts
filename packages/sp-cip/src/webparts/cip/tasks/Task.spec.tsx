import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as React from 'react';
import Task from './Task';

it('Should render correctly', () => {
    render(<Task />);

    expect(screen.getByTestId('text')).toHaveTextContent('test');
});