import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FilterIcon, Icon, SortIcon } from './icons.jsx';
import { statusVariant } from './sampleData.js';
import './tokens.css';
import './DataGrid.css';

const fmtNumber = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Currency symbols as shown in the Figma mock ("$245,800.50", "CHF 780,250.00",
   "-€15,980.40") — sign precedes the symbol, ISO-code currencies keep a space */
const CURRENCY_SYMBOL = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
  BRL: 'R$',
  CAD: 'CA$',
  MXN: 'MX$',
  CHF: 'CHF ',
  AED: 'AED '
};

const fmtCurrency = (n, code) => {
  const symbol = CURRENCY_SYMBOL[code] ?? (code ? `${code} ` : '');
  return `${n < 0 ? '-' : ''}${symbol}${fmtNumber(Math.abs(n))}`;
};

const DENSITY_ICON = {
  compact: 'densityCompact',
  standard: 'densityStandard',
  comfortable: 'densityComfortable'
};

/* Stable empty defaults — inline `= []` defaults create a fresh array every
   render, which re-fires the prop-sync effects below in an infinite loop
   ("Maximum update depth exceeded") for any consumer omitting the prop. */
const NO_COLUMNS = [];
const NO_DATA = [];
const NO_FILTERS = [];

/**
 * Accounting DataGrid — Storybook mirror of the Figma "Complete DG" set.
 * Props map 1:1 to Figma component properties; see story argTypes.
 */
export function DataGrid({
  columns = NO_COLUMNS,
  data = NO_DATA,
  density = 'standard',
  zebra = true,
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 8,
  loading = false,
  filters = NO_FILTERS,
  savedView = 'Saved View'
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null); // { key, dir: 'asc' | 'desc' }
  const [hidden, setHidden] = useState(() => new Set());
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(0);
  const [colMenu, setColMenu] = useState(null); // { x, y } — document coords
  const [scrolled, setScrolled] = useState({ x: false, y: false, xEnd: false });
  const scrollRef = useRef(null);

  // Detect horizontal overflow on mount and layout changes so the right-edge
  // pin shadow shows before the user ever scrolls
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const xEnd = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setScrolled((s) => (s.xEnd === xEnd ? s : { ...s, xEnd }));
  });
  const [densityState, setDensityState] = useState(density);
  const [activeFilters, setActiveFilters] = useState(filters);
  const [order, setOrder] = useState(() => columns.map((c) => c.key));
  const [dragKey, setDragKey] = useState(null);
  const [dropKey, setDropKey] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [editing, setEditing] = useState(null); // { rowId, key, value, error }
  const [columnFilters, setColumnFilters] = useState({}); // colKey -> [values]
  const [filterMenu, setFilterMenu] = useState(null); // { colKey, x, y }
  const [toolbarMenu, setToolbarMenu] = useState(null); // { kind: 'filters'|'saved', x, y }
  const [colWidths, setColWidths] = useState({}); // colKey -> resized px
  const [containerW, setContainerW] = useState(0);
  const [viewLabel, setViewLabel] = useState(savedView);
  const rowRefs = useRef([]);
  const rootRef = useRef(null);
  const filterMenuRef = useRef(null);
  const toolbarMenuRef = useRef(null);
  const colMenuRef = useRef(null);

  useEffect(() => setViewLabel(savedView), [savedView]);

  // Container width drives responsive behavior (column auto-hiding, card view).
  // Measured after every render (guarded set — converges immediately), with
  // ResizeObserver/window-resize keeping it live between renders.
  const measureContainer = () => {
    const el = rootRef.current;
    if (!el) return;
    const w = Math.round(el.getBoundingClientRect().width);
    setContainerW((prev) => (prev === w ? prev : w));
  };
  useEffect(() => {
    measureContainer();
  });
  useEffect(() => {
    window.addEventListener('resize', measureContainer);
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measureContainer) : null;
    if (ro && rootRef.current) ro.observe(rootRef.current);
    return () => {
      window.removeEventListener('resize', measureContainer);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep every dropdown panel inside the browser viewport: shift horizontally
  // when it would overflow an edge, flip above the anchor when there is no
  // room below. Runs once per open (guarded by the `clamped` flag).
  const useViewportClamp = (state, setState, ref) => {
    useEffect(() => {
      if (!state || state.clamped) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let dx = 0;
      let dy = 0;
      if (r.right > vw - 8) dx = vw - 8 - r.right;
      if (r.left + dx < 8) dx = 8 - r.left;
      if (r.bottom > vh - 8) {
        const flippedTop = (state.anchorTop ?? r.top) - r.height - 6;
        dy = flippedTop >= 8 ? flippedTop - r.top : vh - 8 - r.bottom;
      }
      if (dx !== 0 || dy !== 0) {
        setState((s) => (s ? { ...s, x: s.x + dx, y: s.y + dy, clamped: true } : s));
      } else {
        setState((s) => (s ? { ...s, clamped: true } : s));
      }
    }, [state, setState, ref]);
  };
  useViewportClamp(filterMenu, setFilterMenu, filterMenuRef);
  useViewportClamp(toolbarMenu, setToolbarMenu, toolbarMenuRef);
  useViewportClamp(colMenu, setColMenu, colMenuRef);

  // Keep internal state in sync when the prop changes. The functional updates
  // bail out on shallow-equal values, so even unstable array references from
  // a consumer (inline literals) converge instead of re-rendering.
  useEffect(() => setDensityState(density), [density]);
  useEffect(() => {
    setActiveFilters((prev) =>
      prev === filters || (prev.length === filters.length && prev.every((v, i) => v === filters[i]))
        ? prev
        : filters
    );
  }, [filters]);
  useEffect(() => {
    setOrder((prev) => {
      const next = columns.map((c) => c.key);
      return prev.length === next.length && prev.every((k, i) => k === next[i]) ? prev : next;
    });
  }, [columns]);

  // Column order follows the Customize Columns drag order
  const orderedColumns = order.map((k) => columns.find((c) => c.key === k)).filter(Boolean);
  const userVisible = orderedColumns.filter((c) => !hidden.has(c.key));

  const effWidth = (c) => colWidths[c.key] ?? c.width ?? 120;

  // Mobile card layout below 480px (Figma: Mobile / Cards at 390). Between
  // 480 and the core-column width the table scrolls with pinned edges.
  const mobile = containerW > 0 && containerW < 480;

  // Responsive auto-hiding: drop lowest-priority columns until the rest fit
  // (Figma: Tablet → prioritized columns). Manual hiding still applies first.
  const autoHidden = useMemo(() => {
    if (mobile || containerW === 0) return new Set();
    const chrome = (selectable ? 40 : 0) + 44 + 2;
    const dropped = new Set();
    let total = userVisible.reduce((s, c) => s + effWidth(c), 0);
    const droppable = [...userVisible].sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1));
    for (const c of droppable) {
      if (total + chrome <= containerW) break;
      if ((c.priority ?? 1) <= 4) continue; // core columns never auto-hide — below this width the grid scrolls with pinned edges instead
      dropped.add(c.key);
      total -= effWidth(c);
    }
    return dropped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerW, mobile, selectable, userVisible.map((c) => c.key).join(), colWidths]);

  const visibleColumns = userVisible.filter((c) => !autoHidden.has(c.key));

  // ── Column resizing (pointer drag on the header edge) ──
  const startResize = (e, col) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = effWidth(col);
    const min = Math.min(startW, Math.max(64, (col.width ?? 120) - 40));
    const onMove = (ev) =>
      setColWidths((w) => ({ ...w, [col.key]: Math.max(min, startW + ev.clientX - startX) }));
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const reorderColumn = (fromKey, toKey) => {
    if (!fromKey || !toKey || fromKey === toKey) return;
    // the identity column (priority 1) is locked in first position
    const lockedKey = columns.find((c) => (c.priority ?? 9) === 1)?.key;
    if (fromKey === lockedKey || toKey === lockedKey) return;
    setOrder((o) => {
      const next = o.filter((k) => k !== fromKey);
      next.splice(next.indexOf(toKey), 0, fromKey);
      return next;
    });
  };

  // Inline edits overlay the incoming data without mutating the prop
  const effectiveData = useMemo(
    () => data.map((r) => (overrides[r.id] ? { ...r, ...overrides[r.id] } : r)),
    [data, overrides]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return effectiveData.filter((row) => {
      const matchesQuery =
        !q || columns.some((c) => String(row[c.key] ?? '').toLowerCase().includes(q));
      const matchesFilters = Object.entries(columnFilters).every(
        ([key, values]) => values.length === 0 || values.includes(String(row[key]))
      );
      return matchesQuery && matchesFilters;
    });
  }, [effectiveData, columns, query, columnFilters]);

  // ── Column filters (Figma: Header Cell → Filter, Filter Chip) ──
  const toggleColumnFilter = (colKey, value) => {
    setColumnFilters((f) => {
      const current = f[colKey] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...f, [colKey]: next };
    });
    setPage(0);
  };

  const activeColumnChips = Object.entries(columnFilters).flatMap(([key, values]) => {
    const col = columns.find((c) => c.key === key);
    return values.map((value) => ({ colKey: key, value, label: `${col?.label}: ${value}` }));
  });

  // ── Saved views (Figma: Toolbar → Saved View select) ──
  const SAVED_VIEWS = [
    { label: 'All accounts' },
    { label: 'Active accounts', filters: { status: ['Active'] } },
    { label: 'High balances first', sort: { key: 'balance', dir: 'desc' } },
    { label: 'United States', filters: { country: ['United States'] } }
  ];

  const applySavedView = (view) => {
    setColumnFilters(view.filters ?? {});
    setSort(view.sort ?? null);
    setViewLabel(view.label);
    setPage(0);
    setToolbarMenu(null);
  };

  // Card layout anatomy (Figma: Customer Account Card)
  const titleCol = orderedColumns.find((c) => (c.priority ?? 9) === 1) ?? orderedColumns[0];
  const badgeCol = orderedColumns.find((c) => c.badge);
  const cardCols = orderedColumns
    .filter((c) => c !== titleCol && c !== badgeCol)
    .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9))
    .slice(0, 3);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    const out = [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      // Null-safe: empty numerics sort lowest, empty strings sort first
      const cmp = col?.numeric
        ? (av ?? -Infinity) - (bv ?? -Infinity)
        : String(av ?? '').localeCompare(String(bv ?? ''));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const rows = pagination ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize) : sorted;
  const rangeStart = sorted.length === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min((safePage + 1) * pageSize, sorted.length);

  const toggleSort = (key) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'asc' };
      return s.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' };
    });
  };

  const toggleRow = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () => {
    setSelected((s) => {
      const next = new Set(s);
      if (allOnPageSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  // ── Inline editing (Figma: Row Cell → State=Editing | Error) ──
  const startEdit = (row, col) => {
    if (!col.editable) return;
    const current = row[col.key];
    setEditing({ rowId: row.id, key: col.key, value: current == null ? '' : String(current), error: false });
  };

  const commitEdit = () => {
    if (!editing) return;
    const col = columns.find((c) => c.key === editing.key);
    let value = editing.value.trim();
    // Clearing a value is not a valid commit — show the Error cell state
    // rather than accepting an empty cell (Escape reverts instead)
    if (value === '') {
      setEditing((e) => ({ ...e, error: true }));
      return false;
    }
    if (col?.numeric) {
      // Strip formatting only (thousands separators, currency prefix) — anything
      // else must parse as a number or the cell enters the Error state
      const cleaned = value.replace(/,/g, '').replace(/^(R\$|CA\$|MX\$|CHF|AED|[$£€¥₩])\s*/i, '');
      const n = Number(cleaned);
      if (cleaned === '' || Number.isNaN(n)) {
        setEditing((e) => ({ ...e, error: true }));
        return false;
      }
      value = n;
    }
    setOverrides((o) => ({
      ...o,
      [editing.rowId]: { ...o[editing.rowId], [editing.key]: value }
    }));
    setEditing(null);
    return true;
  };

  const cancelEdit = () => setEditing(null);

  const onRowKeyDown = (e, row, index) => {
    // Don't hijack keys aimed at inputs, checkboxes, or buttons inside the row
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter') {
      const firstEditable = visibleColumns.find((c) => c.editable);
      if (firstEditable) {
        e.preventDefault();
        startEdit(row, firstEditable);
      }
    } else if (e.key === ' ' && selectable) {
      e.preventDefault();
      toggleRow(row.id);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      rowRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      rowRefs.current[index - 1]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      rowRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      rowRefs.current[rows.length - 1]?.focus();
    }
  };

  const onScroll = (e) => {
    const { scrollLeft, scrollTop, clientWidth, scrollWidth } = e.currentTarget;
    setScrolled((s) => {
      const next = {
        x: scrollLeft > 0,
        y: scrollTop > 0,
        xEnd: scrollLeft + clientWidth < scrollWidth - 1
      };
      return next.x === s.x && next.y === s.y && next.xEnd === s.xEnd ? s : next;
    });
    // header cells move under internal scroll — dismiss any open filter menu
    setFilterMenu((m) => (m ? null : m));
  };

  const ariaSort = (key) => {
    if (!sort || sort.key !== key) return 'none';
    return sort.dir === 'asc' ? 'ascending' : 'descending';
  };

  const sortState = (key) => {
    if (sort?.key !== key) return 'default';
    return sort.dir === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div
      ref={rootRef}
      className="dg"
      data-density={densityState}
      data-mobile={mobile}
      data-selectable={selectable}
      data-scrolled-x={scrolled.x}
      data-scrolled-x-end={scrolled.xEnd}
      data-scrolled-y={scrolled.y}
    >
      {/* ── Toolbar (Figma: Toolbar component) ── */}
      <div className="dg-toolbar">
        <div className="dg-searchwrap">
          <Icon name="search" size={16} />
          <input
            type="search"
            className="dg-search"
            placeholder="Search"
            aria-label="Search accounts"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
          {query && (
            <button
              type="button"
              className="dg-iconbtn dg-searchclear"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                setPage(0);
              }}
            >
              <Icon name="close16" size={16} />
            </button>
          )}
        </div>
        {/* Visually hidden — remains a live region so filter results are announced */}
        <p className="dg-status dg-vh" role="status">
          {filtered.length} of {data.length} accounts
        </p>
        <div className="dg-toolbar-spacer" />

        <button
          type="button"
          className="dg-btn dg-select"
          aria-haspopup="true"
          aria-expanded={toolbarMenu?.kind === 'saved'}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setToolbarMenu((m) =>
              m?.kind === 'saved'
                ? null
                : { kind: 'saved', x: r.left + window.scrollX, y: r.bottom + window.scrollY + 6, anchorTop: r.top }
            );
          }}
        >
          {viewLabel}
          <Icon name="arrowDropDown" size={16} />
        </button>

        <button
          type="button"
          className="dg-btn"
          aria-label="Filters"
          aria-haspopup="true"
          aria-expanded={toolbarMenu?.kind === 'filters'}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setToolbarMenu((m) =>
              m?.kind === 'filters'
                ? null
                : { kind: 'filters', x: r.left + window.scrollX, y: r.bottom + window.scrollY + 6, anchorTop: r.top }
            );
          }}
        >
          <Icon name="filterList" size={16} />
          <span className="dg-btn-label">Filters</span>
        </button>

        {/* Toolbar dropdowns — portaled like the column filter menu */}
        {toolbarMenu &&
          createPortal(
            <>
              <div className="dg-filterbackdrop" onClick={() => setToolbarMenu(null)} />
              <div
                ref={toolbarMenuRef}
                className="dg-filtermenu"
                role="group"
                aria-label={toolbarMenu.kind === 'saved' ? 'Saved views' : 'Filters'}
                style={{ left: toolbarMenu.x, top: toolbarMenu.y }}
              >
                {toolbarMenu.kind === 'saved' ? (
                  <>
                    <p className="dg-colmenu-title">Saved Views</p>
                    {SAVED_VIEWS.map((view) => (
                      <button
                        key={view.label}
                        type="button"
                        className="dg-menuitem"
                        aria-pressed={viewLabel === view.label}
                        onClick={() => applySavedView(view)}
                      >
                        {view.label}
                        {viewLabel === view.label && (
                          <Icon name="check" size={14} className="dg-menucheck" />
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="dg-colmenu-title">Filters</p>
                    {columns
                      .filter((c) => c.filter)
                      .map((col) => (
                        <div key={col.key}>
                          <p className="dg-menusection">{col.label}</p>
                          {[...new Set(data.map((r) => String(r[col.key])))].sort().map((value) => (
                            <label key={value}>
                              <input
                                type="checkbox"
                                checked={(columnFilters[col.key] ?? []).includes(value)}
                                onChange={() => {
                                  toggleColumnFilter(col.key, value);
                                  setToolbarMenu(null);
                                }}
                              />
                              {value}
                            </label>
                          ))}
                        </div>
                      ))}
                  </>
                )}
              </div>
            </>,
            document.body
          )}

        {/* Density segmented toggle (Figma: Density component / variable modes) */}
        <div className="dg-segmented" role="group" aria-label="Row density">
          {['compact', 'standard', 'comfortable'].map((d) => (
            <button
              key={d}
              type="button"
              className={densityState === d ? 'active' : ''}
              aria-pressed={densityState === d}
              aria-label={`${d[0].toUpperCase()}${d.slice(1)} density`}
              title={`${d[0].toUpperCase()}${d.slice(1)}`}
              onClick={() => setDensityState(d)}
            >
              <Icon name={DENSITY_ICON[d]} size={16} />
            </button>
          ))}
        </div>

        <button type="button" className="dg-iconbtn" aria-label="Download">
          <Icon name="download" size={18} />
        </button>
        <button
          type="button"
          className="dg-iconbtn"
          aria-label="Columns"
          aria-expanded={!!colMenu}
          aria-haspopup="true"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setColMenu((m) =>
              m ? null : { x: r.right + window.scrollX, y: r.bottom + window.scrollY + 6, anchorTop: r.top }
            );
          }}
        >
          <Icon name="settings" size={18} />
        </button>
        {/* Portaled to <body> so the grid's overflow:hidden cannot clip it */}
        {colMenu &&
          createPortal(
            <>
              <div className="dg-filterbackdrop" onClick={() => setColMenu(null)} />
              <div
                ref={colMenuRef}
                className="dg-colmenu"
                role="group"
                aria-label="Customize columns"
                style={{ left: colMenu.x, top: colMenu.y }}
              >
                <p className="dg-colmenu-title">Customize Columns</p>
            {orderedColumns.map((c) =>
              (c.priority ?? 9) === 1 ? (
                /* identity column: locked first, always visible */
                <label key={c.key} className="locked">
                  <Icon name="lock" size={14} className="dg-drag" />
                  <input type="checkbox" checked disabled readOnly />
                  {c.label}
                </label>
              ) : (
              <label
                key={c.key}
                draggable
                className={[dragKey === c.key ? 'dragging' : '', dropKey === c.key ? 'drop-target' : '']
                  .join(' ')
                  .trim()}
                onDragStart={(e) => {
                  setDragKey(c.key);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', c.key);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dropKey !== c.key) setDropKey(c.key);
                }}
                onDragLeave={() => {
                  if (dropKey === c.key) setDropKey(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  reorderColumn(e.dataTransfer.getData('text/plain') || dragKey, c.key);
                  setDragKey(null);
                  setDropKey(null);
                }}
                onDragEnd={() => {
                  setDragKey(null);
                  setDropKey(null);
                }}
              >
                <Icon name="dragIndicator" size={16} className="dg-drag" />
                <input
                  type="checkbox"
                  checked={!hidden.has(c.key)}
                  onChange={() =>
                    setHidden((h) => {
                      const next = new Set(h);
                      next.has(c.key) ? next.delete(c.key) : next.add(c.key);
                      return next;
                    })
                  }
                />
                {c.label}
              </label>
              )
            )}
              </div>
            </>,
            document.body
          )}
      </div>

      {/* ── Filter chips (Figma: Toolbar → State=Filters, Filter Chip) ── */}
      {(activeFilters.length > 0 || activeColumnChips.length > 0) && (
        <div className="dg-chips" role="group" aria-label="Active filters">
          {activeFilters.map((f) => (
            <span key={f} className="dg-chip">
              <Icon name="check" size={14} />
              {f}
              <button
                type="button"
                aria-label={`Remove filter ${f}`}
                onClick={() => setActiveFilters((fs) => fs.filter((x) => x !== f))}
              >
                <Icon name="close" size={14} />
              </button>
            </span>
          ))}
          {activeColumnChips.map((chip) => (
            <span key={`${chip.colKey}:${chip.value}`} className="dg-chip">
              <Icon name="check" size={14} />
              {chip.label}
              <button
                type="button"
                aria-label={`Remove filter ${chip.label}`}
                onClick={() => toggleColumnFilter(chip.colKey, chip.value)}
              >
                <Icon name="close" size={14} />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="dg-clearall"
            onClick={() => {
              setActiveFilters([]);
              setColumnFilters({});
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Column filter menu (Figma: Column Options pattern + Elevation/Menu),
             portaled to <body> so the grid's overflow:hidden cannot clip it ── */}
      {filterMenu &&
        createPortal(
          <>
          <div className="dg-filterbackdrop" onClick={() => setFilterMenu(null)} />
          <div
            ref={filterMenuRef}
            className="dg-filtermenu"
            role="group"
            aria-label={`Filter by ${columns.find((c) => c.key === filterMenu.colKey)?.label}`}
            style={{ left: filterMenu.x, top: filterMenu.y }}
          >
            <p className="dg-colmenu-title">
              Filter by {columns.find((c) => c.key === filterMenu.colKey)?.label}
            </p>
            {[...new Set(data.map((r) => String(r[filterMenu.colKey])))].sort().map((value) => (
              <label key={value}>
                <input
                  type="checkbox"
                  checked={(columnFilters[filterMenu.colKey] ?? []).includes(value)}
                  onChange={() => {
                    toggleColumnFilter(filterMenu.colKey, value);
                    setFilterMenu(null); // apply and dismiss
                  }}
                />
                {value}
              </label>
            ))}
            <button
              type="button"
              className="dg-clearall"
              onClick={() => {
                setColumnFilters((f) => ({ ...f, [filterMenu.colKey]: [] }));
                setPage(0);
                setFilterMenu(null);
              }}
            >
              Clear
            </button>
          </div>
          </>,
          document.body
        )}

      {/* ── Bulk actions (Figma: Bulk Actions component) ── */}
      {selectable && selected.size > 0 && (
        <div className="dg-bulk" role="toolbar" aria-label="Bulk actions">
          <span className="dg-bulk-count">{selected.size} selected</span>
          <button type="button" className="dg-bulk-link">Delete Accounts</button>
          <button type="button" className="dg-bulk-link">Assign New Manager</button>
          <button type="button" className="dg-bulk-link">Export</button>
        </div>
      )}

      {/* ── Mobile card layout (Figma: Mobile / Cards) ── */}
      {mobile ? (
        <div className="dg-cards">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="dg-card">
                <span className="dg-skeleton" style={{ width: '55%' }} />
                <span className="dg-skeleton" style={{ width: '80%' }} />
                <span className="dg-skeleton" style={{ width: '65%' }} />
              </div>
            ))}
          {!loading && rows.length === 0 && (
            <div className="dg-cards-empty">
              {query ? `No accounts match “${query}”.` : 'No accounts to display.'}
            </div>
          )}
          {!loading &&
            rows.map((row) => (
              <div
                key={row.id}
                className={[
                  'dg-card',
                  selected.has(row.id) ? 'selected' : '',
                  row.error ? 'row-error' : ''
                ]
                  .join(' ')
                  .trim()}
              >
                <div className="dg-card-head">
                  {selectable && (
                    <input
                      type="checkbox"
                      aria-label={`Select ${row[titleCol.key]}`}
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  )}
                  <span className="dg-card-title">{row[titleCol.key]}</span>
                  {badgeCol && (
                    <span className={`dg-badge ${statusVariant[row[badgeCol.key]] ?? 'neutral'}`}>
                      {row[badgeCol.key]}
                    </span>
                  )}
                  <button
                    type="button"
                    className="dg-iconbtn"
                    aria-label={`Actions for ${row[titleCol.key]}`}
                  >
                    <Icon name="moreVert" size={16} />
                  </button>
                </div>
                {cardCols.map((col) => {
                  const v = row[col.key];
                  return (
                    <div key={col.key} className="dg-card-row">
                      <span className="dg-card-label">{col.label}</span>
                      <span
                        className={[
                          'dg-card-value',
                          col.numeric ? 'numeric' : '',
                          col.numeric && v != null && v < 0 ? 'negative' : ''
                        ]
                          .join(' ')
                          .trim()}
                      >
                        {col.numeric
                          ? v == null
                            ? '–'
                            : col.currencyFrom
                              ? fmtCurrency(v, row[col.currencyFrom])
                              : fmtNumber(v)
                          : v}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      ) : (
      <div className="dg-scroll" ref={scrollRef} onScroll={onScroll}>
        {/* min-width = sum of column widths, so narrow containers scroll
            horizontally instead of crushing columns into truncated headers */}
        <table
          style={{
            minWidth:
              (selectable ? 40 : 0) +
              44 +
              visibleColumns.reduce((sum, c) => sum + effWidth(c), 0)
          }}
        >
          {/* Fixed layout: column widths stay stable across sorting, filtering, and paging */}
          <colgroup>
            {selectable && <col style={{ width: 40 }} />}
            {visibleColumns.map((c) => (
              <col key={c.key} style={{ width: effWidth(c) }} />
            ))}
            <col style={{ width: 44 }} />
          </colgroup>
          <thead>
            <tr>
              {selectable && (
                <th className="check" scope="col">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {visibleColumns.map((c, i) => (
                <th
                  key={c.key}
                  scope="col"
                  className={[c.numeric ? 'numeric' : '', i === 0 ? 'pinned' : ''].join(' ')}
                  aria-sort={sortable && c.sortable ? ariaSort(c.key) : undefined}
                >
                  {sortable && c.sortable ? (
                    <button type="button" className="dg-sortbtn" onClick={() => toggleSort(c.key)}>
                      {c.label}
                      <SortIcon state={sortState(c.key)} size={16} className="dg-sorticon" />
                    </button>
                  ) : c.filter ? (
                    <span className="dg-headfilter">
                      {c.label}
                      <button
                        type="button"
                        className={`dg-iconbtn dg-filterbtn${(columnFilters[c.key] ?? []).length ? ' active' : ''}`}
                        aria-label={`Filter ${c.label}`}
                        aria-expanded={filterMenu?.colKey === c.key}
                        aria-haspopup="true"
                        onClick={(e) => {
                          // document coordinates: the portaled menu scrolls with
                          // the page, staying anchored under this header cell
                          const r = e.currentTarget.getBoundingClientRect();
                          setFilterMenu((m) =>
                            m?.colKey === c.key
                              ? null
                              : {
                                  colKey: c.key,
                                  x: r.left + window.scrollX,
                                  y: r.bottom + window.scrollY + 6,
                                  anchorTop: r.top
                                }
                          );
                        }}
                      >
                        <FilterIcon size={16} />
                      </button>
                    </span>
                  ) : (
                    c.label
                  )}
                  {/* pointer-drag resize handle on the column's right edge */}
                  <span
                    className="dg-resize"
                    aria-hidden="true"
                    onPointerDown={(e) => startResize(e, c)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              ))}
              <th className="actions" scope="col">
                <span className="dg-vh">Row actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className={zebra && i % 2 === 1 ? 'zebra' : ''}>
                  {selectable && <td className="check" />}
                  {visibleColumns.map((c) => (
                    <td key={c.key}>
                      <span className="dg-skeleton" style={{ width: c.numeric ? '60%' : '80%' }} />
                    </td>
                  ))}
                  <td className="actions" />
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td className="dg-empty" colSpan={visibleColumns.length + 1 + (selectable ? 1 : 0)}>
                  {query
                    ? `No accounts match “${query}”. Try a different search.`
                    : 'No accounts to display.'}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row, i) => {
                const isSelected = selected.has(row.id);
                const rowClass = [
                  zebra && i % 2 === 1 ? 'zebra' : '',
                  isSelected ? 'selected' : '',
                  row.error ? 'row-error' : ''
                ]
                  .join(' ')
                  .trim();
                return (
                  <tr
                    key={row.id}
                    className={rowClass}
                    tabIndex={0}
                    aria-selected={selectable ? isSelected : undefined}
                    ref={(el) => (rowRefs.current[i] = el)}
                    onKeyDown={(e) => onRowKeyDown(e, row, i)}
                  >
                    {selectable && (
                      <td className="check">
                        <input
                          type="checkbox"
                          aria-label={`Select ${row.name}`}
                          checked={isSelected}
                          onChange={() => toggleRow(row.id)}
                        />
                      </td>
                    )}
                    {visibleColumns.map((c, ci) => {
                      const value = row[c.key];
                      const pinned = ci === 0 ? 'pinned' : '';
                      const isEditing = editing && editing.rowId === row.id && editing.key === c.key;

                      if (isEditing) {
                        const cls = [
                          c.numeric ? 'numeric' : '',
                          'editing',
                          editing.error ? 'cell-error' : '',
                          pinned
                        ]
                          .join(' ')
                          .trim();
                        return (
                          <td key={c.key} className={cls}>
                            <input
                              className="dg-cell-input"
                              aria-label={`Edit ${c.label}`}
                              aria-invalid={editing.error || undefined}
                              autoFocus
                              value={editing.value}
                              onChange={(e) =>
                                setEditing((ed) => ({ ...ed, value: e.target.value, error: false }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit();
                                else if (e.key === 'Escape') cancelEdit();
                                e.stopPropagation();
                              }}
                              onBlur={() => {
                                if (commitEdit() === false) cancelEdit();
                              }}
                            />
                          </td>
                        );
                      }

                      if (c.badge) {
                        return (
                          <td key={c.key} className={['badge-cell', pinned].join(' ').trim()}>
                            <span className={`dg-badge ${statusVariant[value] ?? 'neutral'}`}>{value}</span>
                          </td>
                        );
                      }
                      if (c.numeric) {
                        // Null/undefined renders as "–" (per the design's Pending
                        // rows) — never a fabricated $0.00
                        const isEmpty = value == null;
                        const cls = ['numeric', !isEmpty && value < 0 ? 'negative' : '', c.editable ? 'editable' : '', pinned]
                          .join(' ')
                          .trim();
                        return (
                          <td key={c.key} className={cls} onDoubleClick={() => startEdit(row, c)}>
                            {isEmpty ? '–' : c.currencyFrom ? fmtCurrency(value, row[c.currencyFrom]) : fmtNumber(value)}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={c.key}
                          className={[c.editable ? 'editable' : '', pinned].join(' ').trim()}
                          onDoubleClick={() => startEdit(row, c)}
                        >
                          {value}
                        </td>
                      );
                    })}
                    <td className="actions">
                      <button type="button" className="dg-iconbtn" aria-label={`Actions for ${row.name}`}>
                        <Icon name="moreVert" size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      )}

      {/* ── Footer (Figma: Table Footer → Type=Pagination) ── */}
      {pagination && !loading && sorted.length > 0 && (
        <div className="dg-footer">
          <span className="dg-showing">
            Showing {rangeStart} - {rangeEnd} of {sorted.length}
          </span>
          <div className="dg-toolbar-spacer" />
          <button
            type="button"
            className="dg-pagebtn"
            aria-label="Previous page"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <Icon name="chevronLeft" size={16} />
          </button>
          <select
            className="dg-pageselect"
            aria-label="Page number"
            value={safePage}
            onChange={(e) => setPage(Number(e.target.value))}
          >
            {Array.from({ length: pageCount }).map((_, p) => (
              <option key={p} value={p}>
                {p + 1}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="dg-pagebtn"
            aria-label="Next page"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
