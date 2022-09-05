---
to: <%= locals.to || `src/webparts/${h.webPart}/components` %>/<%= Name %>/<%= Name %>.module.scss
---
@import '~office-ui-fabric-react/dist/sass/References.scss';

.container {
    min-width: 1px;
}