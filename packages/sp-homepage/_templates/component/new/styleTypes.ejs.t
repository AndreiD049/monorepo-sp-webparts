---
to: <%= locals.to || `src/webparts/${h.webPart}/components` %>/<%= Name %>/<%= Name %>.module.scss.d.ts
---
export interface CssExports {
    container: string;
}

const CssExports: CssExports;
export default CssExports;
