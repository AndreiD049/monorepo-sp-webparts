---
to: src/properties/PropertyPane<%= Name %>/components/<%= Name %>.tsx
---
import * as React from 'react';
import { I<%= Name %>Props } from './I<%= Name %>Props';

export const <%= Name %>: React.FC<I<%= Name %>Props> = (props) => {
    return (
        <div>
            <label htmlFor="<%= name %>">{props.label}</label>
            <input id="<%= name %>" value={props.value} onChange={(ev) => props.onChange(ev.target.value)} />
        </div>
    )
}
