---
to: src/setup/tables/create-lists.ts
inject: true
prepend: true
skip_if: import ensureFields<%= h.inflection.capitalize(name) %> from './<%= name %>-list'
---
import ensureFields<%= h.inflection.capitalize(name) %> from './<%= name %>-list';