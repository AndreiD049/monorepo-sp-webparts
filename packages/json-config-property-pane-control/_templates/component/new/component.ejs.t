---
to: src/webparts/<%= h.webPart %>/components/<%= Name %>/index.tsx
---
import * as React from 'react';
import styles from './<%= Name %>.module.scss';

export interface I<%= Name %>Props {
    // Props go here
}

export const <%= Name %>: React.FC<I<%= Name %>Props> = (props) => {
    return (
        <div><%= Name %></div>
    );
};
