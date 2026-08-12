# CWAN DataGrid — Storybook

Companion Storybook to the **CWAN-Exercise** Figma file (Data Grid component task).
The `DataGrid` component's props map 1:1 to the Figma component properties, and all
design tokens mirror the Figma `Accounting` / `Data Grid` variable collections
(see `src/DataGrid/tokens.css`).

## View without installing anything

The `storybook-static/` folder is a prebuilt Storybook. Serve it with any static
server — on macOS the preinstalled Python works, no other tools needed:

```
python3 -m http.server 8080 --directory storybook-static
```

then open http://localhost:8080 in a browser. (Node users: `npx http-server storybook-static` works too.)

## Run the live dev version

```
npm install
npm run storybook
```

Includes 13 stories (states, densities, pinned column), five self-running
interaction tests (search, sort, column visibility, inline editing, column
filtering), an accessibility checklist, and a Design Tokens page whose values
are read live from the CSS.
