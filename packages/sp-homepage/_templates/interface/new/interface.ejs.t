---
to: src/webparts/<%= h.webPart %>/models/I<%= Name %>.ts
---
<%
let front = locals.export ? 'export ' : '';
front += locals.default ? 'default ' : '';
-%>
<%= front %>interface I<%= Name %> {
<% props.forEach((prop) => { -%>
    <%= prop %>;
<% }); -%>
}
