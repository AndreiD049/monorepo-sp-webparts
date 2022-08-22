---
to: src/setup/tables/<%= list %>-list.ts
inject: true
after: ensureFields
skip_if: const <%= name %>Field = 
---
<%
let field;
switch (locals.type) {
    case 'number':
        field = `<Field Indexed='${locals.indexed ? 'TRUE' : 'FALSE'}' CommaSeparator='TRUE' CustomUnitOnRight='TRUE' Decimals='0' Description='${locals.description}' DisplayName='${ h.inflection.classify(name) }' Format='Dropdown' IsModern='TRUE' Name='${ h.inflection.classify(name) }' Percentage='FALSE' Required='${locals.required ? 'TRUE' : 'FALSE'}' Title='{ h.inflection.classify(name) }' Type='Number' Unit='None'></Field>`
        break;
    case 'date':
        field = `<Field Indexed='${locals.indexed ? 'TRUE' : 'FALSE'}' Description='${locals.description}' DisplayName='${ h.inflection.classify(name) }' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='${ h.inflection.classify(name) }' Required='${locals.required ? 'TRUE' : 'FALSE'}' Title='${ h.inflection.classify(name) }' Type='DateTime'></Field>`
        break;
}
-%>
    const <%= name %>Field = await list.fields.createFieldAsXml(
        `<%- field %>`
    )
    notifyOnFieldCreation(<%= name %>Field)