---
to: src/setup/tables/<%= list %>-list.ts
inject: true
before: FieldRef.*Author
skip_if: FieldRef Name=.*<%= name %>Field.data.InternalName
---
                    <FieldRef Name=\"${<%= name %>Field.data.InternalName}\"/>