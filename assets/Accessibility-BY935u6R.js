import{j as e}from"./index-Dc-0lXyx.js";import{useMDXComponents as r}from"./index--zpct8RJ.js";import{M as o}from"./blocks-Bz90tFBY.js";import"./iframe-CmqQFZxD.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CJ336baV.js";function i(s){const n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Data Grid/Accessibility"}),`
`,e.jsx(n.h1,{id:"accessibility-checklist",children:"Accessibility Checklist"}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Audit record (Aug 12, 2026):"}),` axe-core run against nine story states
(Standard, Without Selection, Filters Applied, Sticky Columns, Tablet,
Mobile, Loading, Empty, Error) plus both open-menu states — `,e.jsx(n.strong,{children:`zero
violations`}),`. The audit itself surfaced and fixed two issues: the mobile
Filters button lost its accessible name when its label was visually hidden
(now `,e.jsx(n.code,{children:"aria-label"}),`), and the mobile breakpoint had swallowed the
sticky-column range (now 480px). The a11y addon re-runs these checks live
on every story.`]}),`
`]}),`
`,e.jsxs(n.p,{children:[`How the DataGrid meets each requirement, and which design token or component
behavior implements it. Automated checks (contrast, roles, labels) run in the
`,e.jsx(n.strong,{children:"Accessibility panel"})," on every story via ",e.jsx(n.code,{children:"@storybook/addon-a11y"}),"."]}),`
`,e.jsx(n.h2,{id:"1-table--grid-semantics",children:"1. Table / grid semantics"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Rendered as a native ",e.jsx(n.code,{children:"<table>"})," with ",e.jsx(n.code,{children:"<thead>"}),", ",e.jsx(n.code,{children:'<th scope="col">'}),", and ",e.jsx(n.code,{children:"<tbody>"}),` —
native semantics are preferred over `,e.jsx(n.code,{children:'role="grid"'}),` because this grid reads more
than it edits (ARIA authoring guidance: use `,e.jsx(n.code,{children:"grid"}),` only for composite-widget
editing surfaces).`]}),`
`,e.jsx(n.li,{children:`Status badges are text, not color alone — each state is named ("Active",
"Suspended"), with the colored dot as a secondary cue.`}),`
`]}),`
`,e.jsx(n.h2,{id:"2-sort-state-and-result-counts-announced",children:"2. Sort state and result counts announced"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Sortable headers set ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"aria-sort"})})," (",e.jsx(n.code,{children:"ascending"})," / ",e.jsx(n.code,{children:"descending"})," / ",e.jsx(n.code,{children:"none"}),`) on the
`,e.jsx(n.code,{children:"<th>"}),`, so screen readers announce the active sort. Verified by the
`,e.jsx(n.strong,{children:"SortToggling"})," interaction test."]}),`
`,e.jsxs(n.li,{children:['The result count ("5 of 12 accounts") is a ',e.jsxs(n.strong,{children:[e.jsx(n.code,{children:'role="status"'})," live region"]}),` that
re-announces whenever search filters the rows. Verified by the
`,e.jsx(n.strong,{children:"SearchFiltering"})," interaction test."]}),`
`,e.jsxs(n.li,{children:[`Row-level errors are conveyed by the Error cell/row treatment plus
`,e.jsx(n.code,{children:"aria-invalid"})," on any offending editor input — not by color alone."]}),`
`]}),`
`,e.jsx(n.h2,{id:"3-keyboard-navigation",children:"3. Keyboard navigation"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:`Every interactive element (search, sort buttons, column menu, checkboxes,
pagination) is a native focusable control — full Tab order for free.`}),`
`,e.jsxs(n.li,{children:["Rows are focusable; ",e.jsx(n.strong,{children:"Arrow Up/Down"})," move between rows, ",e.jsx(n.strong,{children:"Home/End"}),` jump to
first/last, and `,e.jsx(n.strong,{children:"Space"})," toggles selection when the grid is selectable."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Enter"}),` on a focused row opens its first editable cell; while editing,
`,e.jsx(n.strong,{children:"Enter"})," commits and ",e.jsx(n.strong,{children:"Escape"}),` cancels. Invalid numeric input sets
`,e.jsx(n.code,{children:"aria-invalid"})," and the Error cell state (Border-Error + Background-Error)."]}),`
`,e.jsxs(n.li,{children:["Column resize is ",e.jsx(n.strong,{children:"pointer-only"}),` in this demo; keyboard resize
(e.g. Alt+Arrow on the header) is a documented production follow-up.`]}),`
`,e.jsx(n.li,{children:`Documented follow-up for production: full cell-by-cell roving tabindex
(Arrow Left/Right within a row) per the ARIA grid pattern — row-level
navigation ships in this prototype.`}),`
`]}),`
`,e.jsx(n.h2,{id:"4-color-contrast",children:"4. Color contrast"}),`
`,e.jsx(n.p,{children:"Token pairs used by text, checked against WCAG AA (4.5:1 for the sizes used):"}),`
`,e.jsxs(n.p,{children:[`| Pair | Tokens | Ratio |
| --- | --- | --- |
| Cell text on row | On Surface `,e.jsx(n.code,{children:"#1b1b25"})," on ",e.jsx(n.code,{children:"#ffffff"})," / zebra ",e.jsx(n.code,{children:"#f5f2ff"}),` | ≈ 17:1 ✓ |
| Negative value | Color/Value/Negative `,e.jsx(n.code,{children:"#ba1a1a"})," on ",e.jsx(n.code,{children:"#ffffff"}),` | ≈ 6.5:1 ✓ |
| Negative on error row | `,e.jsx(n.code,{children:"#ba1a1a"})," on Row/Error ",e.jsx(n.code,{children:"#ffdad6"}),` | ≈ 5.0:1 ✓ |
| Selected row text | On Secondary Container `,e.jsx(n.code,{children:"#201634"})," on ",e.jsx(n.code,{children:"#ebddff"}),` | ≈ 13:1 ✓ |
| Badge text | e.g. `,e.jsx(n.code,{children:"#1c5128"})," on ",e.jsx(n.code,{children:"#b7f1ba"})," | ≥ 7:1 ✓ |"]}),`
`,e.jsx(n.p,{children:`The a11y addon re-runs these checks live — change a token and the panel
flags any regression.`}),`
`,e.jsx(n.h2,{id:"5-visible-focus-indicators",children:"5. Visible focus indicators"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["All buttons and inputs show a ",e.jsx(n.strong,{children:"2px outline in Color/Cell/Border-Active"}),`
(`,e.jsx(n.code,{children:"#5a5892"}),") via ",e.jsx(n.code,{children:":focus-visible"}),"."]}),`
`,e.jsx(n.li,{children:`Focused rows show the same 2px inset outline, so keyboard position is always
visible against default, zebra, hover, and selected row fills.`}),`
`]}),`
`,e.jsx(n.h2,{id:"interactions-under-test",children:"Interactions under test"}),`
`,e.jsxs(n.p,{children:[`| Interaction | Story | What it asserts |
| --- | --- | --- |
| Search filters rows | `,e.jsx(n.strong,{children:"SearchFiltering"}),` | Row set shrinks; live region announces "5 of 12 accounts" |
| Header click toggles sort | `,e.jsx(n.strong,{children:"SortToggling"})," | ",e.jsx(n.code,{children:"aria-sort"}),` cycles ascending → descending |
| Column visibility | `,e.jsx(n.strong,{children:"ColumnVisibility"}),` | Unchecking a column removes it from the table |
| Column filtering | `,e.jsx(n.strong,{children:"ColumnFiltering"}),` | Funnel opens a value menu; checking filters rows, adds a removable chip, updates the live count |
| Inline editing | `,e.jsx(n.strong,{children:"InlineEditing"})," | Double-click opens editor; Enter commits; invalid numbers set ",e.jsx(n.code,{children:"aria-invalid"}),` + Error state; Escape cancels |
| Row selection (mouse + keyboard) | `,e.jsx(n.strong,{children:"Standard"})," (manual) | Checkbox click and Space both toggle; Arrow keys move row focus |"]})]})}function u(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{u as default};
