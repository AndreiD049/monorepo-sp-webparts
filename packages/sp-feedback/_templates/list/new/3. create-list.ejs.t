---
to: src/setup/tables/create-lists.ts
inject: true
after: hygen-lists-creation
skip_if: const <%= name %>List = await ensureList
---

    const <%= name %>List = await ensureList(<%= name %>ListTitle, sp);
    await ensureFields<%= h.inflection.capitalize(name) %>(<%= name %>List);