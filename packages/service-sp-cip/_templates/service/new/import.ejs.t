---
to: src/webparts/<%= h.webPart %>/<%= h.inflection.capitalize(h.webPart) %>WebPart.ts
inject: true
prepend: true
skip_if: import <%= Name %>Service
---
import <%= Name %>Service from './services/<%= Name %>Service';