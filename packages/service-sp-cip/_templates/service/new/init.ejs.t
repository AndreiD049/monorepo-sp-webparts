---
to: src/webparts/<%= h.webPart %>/<%= h.inflection.capitalize(h.webPart) %>WebPart.ts
inject: true
after: super.onInit
skip_if: <%= Name %>Service.Init
---
    <%= Name %>Service.Init(this.context, this.properties.<%= name %>ServiceListTitle);