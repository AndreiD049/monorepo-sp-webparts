---
to: src/webparts/<%= h.webPart %>/models/I<%= Name %>.ts
---
<%
let front = locals.export === 'yes' ? 'export ' : '';
front += locals.default === 'yes' ? 'default ' : '';
-%>
<%= front %>interface I<%= Name %> {
<% props.forEach((prop) => { -%>
    <%= prop %>;
<% }); -%>
}
