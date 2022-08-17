---
to: src/webparts/<%= h.webPart %>/<%= h.capitalize(h.webPart) %>WebPart.ts
inject: true
after: listsRootUrl. string
skip_if: <%= name %>ListTitle. string
---
  <%= name %>ListTitle: string;