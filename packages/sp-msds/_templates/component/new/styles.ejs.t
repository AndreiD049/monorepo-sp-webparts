---
to: <%= locals.to || `src/webparts/${h.webPart}/components` %>/<%= Name %>/<%= Name %>.module.scss
---
@import '~@fluentui/react/dist/sass/_References.scss';

.container {
    min-width: 1px;
}