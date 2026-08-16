#!/usr/bin/env bash
# Re-capture the Storybook and app screenshots used by the deck.
# Requires Google Chrome; writes into ./assets next to this script.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/assets"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SB="https://gulshanramesh.github.io/cwan-storybook"
APP="https://gulshanramesh.github.io/accounting-app/"

mkdir -p "$DIR"

shot() { # shot <file> <w,h> <url>
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size="$2" --virtual-time-budget=15000 \
    --screenshot="$DIR/$1" "$3" >/dev/null 2>&1
  echo "  ✓ $1"
}

echo "App…"
shot app-full.png   "1440,900" "$APP"
shot app-tablet.png "834,900"  "$APP"
shot app-mobile.png "430,880"  "$APP"

echo "Storybook stories…"
shot sb-standard.png    "1200,700" "$SB/iframe.html?id=data-grid-datagrid--standard&viewMode=story"
shot sb-compact.png     "1200,470" "$SB/iframe.html?id=data-grid-datagrid--compact&viewMode=story"
shot sb-comfortable.png "1200,620" "$SB/iframe.html?id=data-grid-datagrid--comfortable&viewMode=story"
shot sb-filters.png     "1200,620" "$SB/iframe.html?id=data-grid-datagrid--filters-applied&viewMode=story"
shot sb-pinned.png      "640,620"  "$SB/iframe.html?id=data-grid-datagrid--pinned-first-column&viewMode=story"
shot sb-tablet.png      "820,640"  "$SB/iframe.html?id=data-grid-datagrid--tablet-view&viewMode=story"
shot sb-mobile.png      "430,880"  "$SB/iframe.html?id=data-grid-datagrid--mobile-view&viewMode=story"
shot sb-loading.png     "1100,560" "$SB/iframe.html?id=data-grid-datagrid--loading&viewMode=story"
shot sb-empty.png       "1100,420" "$SB/iframe.html?id=data-grid-datagrid--empty&viewMode=story"
shot sb-error.png       "1100,620" "$SB/iframe.html?id=data-grid-datagrid--error&viewMode=story"

echo "Storybook UI…"
shot sb-ui-controls.png     "1500,900" "$SB/?path=/story/data-grid-datagrid--standard"
shot sb-ui-docs.png         "1500,950" "$SB/?path=/docs/data-grid-datagrid--docs"
shot sb-ui-tokens.png       "1500,950" "$SB/?path=/docs/data-grid-design-tokens--docs"
shot sb-ui-a11y.png         "1500,950" "$SB/?path=/docs/data-grid-accessibility--docs"
shot sb-ui-interactions.png "1500,900" "$SB/?path=/story/data-grid-datagrid--search-filtering"

echo "Done. Figma page exports still go in $DIR as figma-foundations.png, figma-components.png, figma-examples.png"
