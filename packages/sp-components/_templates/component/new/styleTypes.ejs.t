---
to: <%= locals.to || `src/components` %>/<%= Name %>/<%= Name %>.module.scss.d.ts
---

interface CssExports {
    container: string;
}
const styles: CssExports;
export default styles;