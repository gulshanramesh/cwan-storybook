import { useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Accounting DataGrid — Storybook mirror of the Figma "Complete DG" set.
 * Props map 1:1 to Figma component properties; see story argTypes.
 */
export function DataGrid({
  columns = [],
  data = [],
  density = 'standard',
  zebra = true,
  sortable = true,
  selectable = false,
  pinnedFirstColumn = false,
  pagination = true,
  pageSize = 8,
  loading = false,
  filters = [],
  savedView = 'Saved View'
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null); // { key, dir: 'asc' | 'desc' }
  const [hidden, setHidden] = useState(() => new Set());
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState({ x: false, y: false });
  const [densityState, setDensityState] = useState(density);
  const [activeFilters, setActiveFilters] = useState(filters);
  const [order, setOrder] = useState(() => columns.map((c) => c.key));
  const [dragKey, setDragKey] = useState(null);
  const [dropKey, setDropKey] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [editing, setEditing] = useState(null); // { rowId, key, value, error }
  const [columnFilters, setColumnFilters] = useState({}); // colKey -> [values]
  const [filterMenu, setFilterMenu] = useState(null); // { colKey, x, y }
  const rowRefs = useRef([]);

  // Keep internal state in sync when the Storybook control changes the prop
  useEffect(() => setDensityState(density), [density]);
  useEffect(() => setActiveFilters(filters), [filters]);
  useEffect(() => setOrder(columns.map((c) => c.key)), [columns]);

  // Column order follows the Customize Columns drag order
  const orderedColumns = order.map((k) => columns.find((c) => c.key === k)).filter(Boolean);
  const visibleColumns = orderedColumns.filter((c) => !hidden.has(c.key));

  const reorderColumn = (fromKey, toKey) => {
    if (!fromKey || !toKey || fromKey === toKey) return;
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

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    const out = [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = col?.numeric ? av - bv : String(av).localeCompare(String(bv));
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
    setEditing({ rowId: row.id, key: col.key, value: String(row[col.key]), error: false });
  };

  const commitEdit = () => {
    if (!editing) return;
    const col = columns.find((c) => c.key === editing.key);
    let value = editing.value.trim();
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
    const { scrollLeft, scrollTop } = e.currentTarget;
    setScrolled((s) => {
      const next = { x: scrollLeft > 0, y: scrollTop > 0 };
      return next.x === s.x && next.y === s.y ? s : next;
    });
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
      className="dg"
      data-density={densityState}
      data-pinned={pinnedFirstColumn}
      data-scrolled-x={scrolled.x}
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

        <button type="button" className="dg-btn dg-select" aria-haspopup="listbox">
          {savedView}
          <Icon name="arrowDropDown" size={16} />
        </button>

        <button type="button" className="dg-btn">
          <Icon name="filterList" size={16} />
          Filters
        </button>

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
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name="settings" size={18} />
        </button>
        {menuOpen && (
          <div className="dg-colmenu" role="group" aria-label="Customize columns">
            <p className="dg-colmenu-title">Customize Columns</p>
            {orderedColumns.map((c) => (
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
            ))}
          </div>
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

      {/* ── Column filter menu (Figma: Column Options pattern + Elevation/Menu) ── */}
      {filterMenu && (
        <>
          <div className="dg-filterbackdrop" onClick={() => setFilterMenu(null)} />
          <div
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
                  onChange={() => toggleColumnFilter(filterMenu.colKey, value)}
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
              }}
            >
              Clear
            </button>
          </div>
        </>
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

      <div className="dg-scroll" onScroll={onScroll}>
        <table>
          {/* Fixed layout: column widths stay stable across sorting, filtering, and paging */}
          <colgroup>
            {selectable && <col style={{ width: 36 }} />}
            {visibleColumns.map((c) => (
              <col key={c.key} style={c.width ? { width: c.width } : undefined} />
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
                  className={[c.numeric ? 'numeric' : '', i === 0 && pinnedFirstColumn ? 'pinned' : ''].join(' ')}
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
                          const r = e.currentTarget.getBoundingClientRect();
                          setFilterMenu((m) =>
                            m?.colKey === c.key ? null : { colKey: c.key, x: r.left, y: r.bottom + 6 }
                          );
                        }}
                      >
                        <FilterIcon size={16} />
                      </button>
                    </span>
                  ) : (
                    c.label
                  )}
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
                      const pinned = ci === 0 && pinnedFirstColumn ? 'pinned' : '';
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
                        const cls = ['numeric', value < 0 ? 'negative' : '', c.editable ? 'editable' : '', pinned]
                          .join(' ')
                          .trim();
                        return (
                          <td key={c.key} className={cls} onDoubleClick={() => startEdit(row, c)}>
                            {c.currencyFrom ? fmtCurrency(value, row[c.currencyFrom]) : fmtNumber(value)}
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
