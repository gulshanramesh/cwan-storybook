/*
 * Material Symbols — the same icon set the Figma components use
 * (search, more_vert, filter_list, download, settings, carets, etc.).
 * Rendered inline so there is no icon-font dependency.
 */

const PATHS = {
  search:
    'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  moreVert:
    'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  filterList: 'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  settings:
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  arrowDropDown: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  chevronLeft: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  chevronRight: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  unfoldMore:
    'M12 5.83 15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z',
  arrowUpward: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
  arrowDownward: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
  viewColumn: 'M14.67 5v14H9.33V5h5.34zm2 14H21V5h-4.33v14zm-9.34 0V5H3v14h4.33z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  dragIndicator:
    'M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  close:
    'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  /* exact 16px close glyph exported from the Figma Search component */
  close16:
    'M4.26666 12.6667L3.33333 11.7334L7.06666 8.00004L3.33333 4.26671L4.26666 3.33337L7.99999 7.06671L11.7333 3.33337L12.6667 4.26671L8.93333 8.00004L12.6667 11.7334L11.7333 12.6667L7.99999 8.93337L4.26666 12.6667Z',
  densityCompact: 'M3 4h18v2H3zm0 4.66h18v2H3zm0 4.67h18v2H3zM3 18h18v2H3z',
  densityStandard: 'M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z',
  densityComfortable: 'M3 7h18v2H3zm0 8h18v2H3z'
};

/*
 * Sort icon — exact SVGs exported from the Figma "Sort" component set
 * (State=Default | Ascending | Descending). Active states inherit the
 * header text color; the default state keeps Figma's #79747E at 80%.
 */
export function SortIcon({ state = 'default', size = 16, className = '' }) {
  return (
    <svg
      className={`dg-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {state === 'ascending' && (
        <path d="M8 10.25L4.5 5.75L11.5 5.75L8 10.25Z" fill="currentColor" />
      )}
      {state === 'descending' && (
        <path d="M8 5.75L11.5 10.25H4.5L8 5.75Z" fill="currentColor" />
      )}
      {state === 'default' && (
        <g opacity="0.8">
          <path d="M8.00001 3.75L10.8 7.25H5.20001L8.00001 3.75Z" fill="#79747E" />
          <path d="M8.00005 12.25L5.20005 8.75L10.8 8.75L8.00005 12.25Z" fill="#79747E" />
        </g>
      )}
    </svg>
  );
}

/* Funnel — exact SVG exported from the Figma "Filter" component (stroke-based) */
export function FilterIcon({ size = 16, className = '' }) {
  return (
    <svg
      className={`dg-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 4.5H12.5L9.22727 8.38889V11.5L6.77273 10.3333V8.38889L3.5 4.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Icon({ name, size = 18, className = '', viewBox = '0 0 24 24' }) {
  return (
    <svg
      className={`dg-icon ${className}`}
      width={size}
      height={size}
      viewBox={name === 'close16' ? '0 0 16 16' : viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
