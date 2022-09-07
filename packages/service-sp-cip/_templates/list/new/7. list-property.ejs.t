---
to: src/webparts/<%= h.webPart %>/<%= h.capitalize(h.webPart) %>WebPart.ts
inject: true
after: hygen-lists
skip_if: PropertyPaneTextField\('<%= name %>ListName'
---
                PropertyPaneTextField('<%= name %>ListTitle', {
                  label: '<%= h.capitalize(name) %> list',
                }),