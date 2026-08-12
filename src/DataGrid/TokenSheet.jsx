import { useLayoutEffect, useRef, useState } from 'react';
import './tokens.css';

/*
 * Token documentation renderer. Every value shown is read from the live CSS
 * custom properties at render time via getComputedStyle — nothing is
 * hand-typed, so this page cannot drift from tokens.css.
 */

const S = {
  table: { borderCollapse: 'collapse', width: '100%', fontSize: 13, marginBottom: 8 },
  th: { textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #ddd', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' },
  td: { padding: '6px 10px', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
  mono: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12 },
  swatch: { display: 'inline-block', width: 28, height: 20, borderRadius: 4, border: '1px solid rgba(0,0,0,0.15)', verticalAlign: 'middle' }
};

function useRootTokens(names) {
  const [vals, setVals] = useState({});
  useLayoutEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const out = {};
    for (const n of names) out[n] = cs.getPropertyValue(n).trim();
    setVals(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return vals;
}

function ColorTable({ rows }) {
  const vals = useRootTokens(rows.map((r) => r.token));
  return (
    <table style={S.table}>
      <thead>
        <tr>
          <th style={S.th}> </th>
          <th style={S.th}>CSS custom property</th>
          <th style={S.th}>Resolved value (live)</th>
          <th style={S.th}>Figma token</th>
          <th style={S.th}>Usage</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.token}>
            <td style={S.td}><span style={{ ...S.swatch, background: `var(${r.token})` }} /></td>
            <td style={{ ...S.td, ...S.mono }}>{r.token}</td>
            <td style={{ ...S.td, ...S.mono }}>{vals[r.token] || '…'}</td>
            <td style={S.td}>{r.figma}</td>
            <td style={S.td}>{r.usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function GridTokens() {
  return (
    <ColorTable
      rows={[
        { token: '--grid-row-default', figma: 'Color/Row/Default → Schemes/Surface Container Lowest', usage: 'Row background' },
        { token: '--grid-row-zebra', figma: 'Color/Row/Zebra → Schemes/Surface Container Low', usage: 'Zebra stripe (applied at 50%, as in Figma)' },
        { token: '--grid-row-hover', figma: 'Color/Row/Hover → Schemes/Surface Container', usage: 'Row hover' },
        { token: '--grid-row-selected', figma: 'Color/Row/Selected → Schemes/Secondary Container', usage: 'Selected rows, density toggle' },
        { token: '--grid-row-error', figma: 'Color/Row/Error → Schemes/Error Container', usage: 'Error rows and error cells' },
        { token: '--grid-value-negative', figma: 'Color/Value/Negative → Schemes/Error', usage: 'Negative amounts' },
        { token: '--grid-value-positive', figma: 'Color/Value/Positive → Extended Colors/Success', usage: 'Positive deltas' },
        { token: '--grid-border', figma: 'Color/Cell/Border-Default → Schemes/Outline Variant', usage: 'Hairline dividers, control borders' },
        { token: '--grid-border-active', figma: 'Color/Cell/Border-Active → Schemes/Primary', usage: 'Focus rings, editing cell stroke' },
        { token: '--grid-chips-bg', figma: 'Color/Chips/Background → Schemes/Surface Variant', usage: 'Filter chips' }
      ]}
    />
  );
}

export function BadgeTokens() {
  const variants = ['success', 'warning', 'error', 'neutral', 'info'];
  const names = variants.flatMap((v) => [`--badge-${v}-bg`, `--badge-${v}-text`]);
  const vals = useRootTokens(names);
  return (
    <table style={S.table}>
      <thead>
        <tr>
          <th style={S.th}>Preview</th>
          <th style={S.th}>Container</th>
          <th style={S.th}>Text</th>
          <th style={S.th}>Figma tokens</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v) => (
          <tr key={v}>
            <td style={S.td}>
              <span
                style={{
                  background: `var(--badge-${v}-bg)`,
                  color: `var(--badge-${v}-text)`,
                  font: '500 11px/16px Roboto, sans-serif',
                  letterSpacing: '0.5px',
                  borderRadius: 999,
                  padding: '2px 10px'
                }}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </span>
            </td>
            <td style={{ ...S.td, ...S.mono }}>{vals[`--badge-${v}-bg`] || '…'}</td>
            <td style={{ ...S.td, ...S.mono }}>{vals[`--badge-${v}-text`] || '…'}</td>
            <td style={S.td}>Color/Badge Container/{v[0].toUpperCase() + v.slice(1)} · Color/Badge Text/{v[0].toUpperCase() + v.slice(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SystemTokens() {
  return (
    <ColorTable
      rows={[
        { token: '--color-primary', figma: 'Schemes/Primary', usage: 'Accents, active states' },
        { token: '--color-on-primary', figma: 'Schemes/On Primary', usage: 'Text/icons on primary' },
        { token: '--color-on-surface', figma: 'Schemes/On Surface (Color/Text/Default)', usage: 'Primary text' },
        { token: '--color-on-surface-variant', figma: 'Schemes/On Surface Variant', usage: 'Secondary text, icons' },
        { token: '--color-outline-variant', figma: 'Schemes/Outline Variant', usage: 'Borders' },
        { token: '--color-surface-lowest', figma: 'Schemes/Surface Container Lowest', usage: 'Cards, rows' },
        { token: '--color-surface-low', figma: 'Schemes/Surface Container Low', usage: 'Subtle surfaces' },
        { token: '--color-surface-container', figma: 'Schemes/Surface Container', usage: 'Hover surfaces' },
        { token: '--color-surface-bright', figma: 'Schemes/Surface Bright (Color/Bulk/Bulk Action Container)', usage: 'Bulk actions bar' },
        { token: '--color-secondary-container', figma: 'Schemes/Secondary Container', usage: 'Selection tint' },
        { token: '--color-on-secondary-container', figma: 'Schemes/On Secondary Container', usage: 'Text on selection tint' },
        { token: '--color-error', figma: 'Schemes/Error', usage: 'Errors, negative values' },
        { token: '--color-error-container', figma: 'Schemes/Error Container', usage: 'Error fills' },
        { token: '--color-on-error-container', figma: 'Extended/On Error Container', usage: 'Text on error fills' },
        { token: '--color-success', figma: 'Extended Colors/Success', usage: 'Positive values' },
        { token: '--color-on-primary-fixed-variant', figma: 'Schemes/On Primary Fixed Variant', usage: 'Search active border' },
        { token: '--color-link', figma: 'Color/Text/Link → Schemes/On Primary Fixed Variant', usage: 'Bulk action links' }
      ]}
    />
  );
}

export function ElevationTokens() {
  const names = ['--elevation-sticky-header', '--elevation-frozen-column', '--elevation-menu'];
  const vals = useRootTokens(names);
  const rows = [
    { token: '--elevation-sticky-header', figma: 'Data Grid/Elevation/Sticky Header', usage: 'Header row, Scrolled state only' },
    { token: '--elevation-frozen-column', figma: 'Data Grid/Elevation/Frozen Column', usage: 'Pinned column edge while horizontally scrolled' },
    { token: '--elevation-menu', figma: 'Data Grid/Elevation/Menu', usage: 'Column Options, filter menus, dropdowns' }
  ];
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 8 }}>
      {rows.map((r) => (
        <div key={r.token} style={{ width: 240 }}>
          <div
            style={{
              height: 56,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 8,
              boxShadow: `var(${r.token})`,
              marginBottom: 8
            }}
          />
          <div style={{ ...S.mono, fontSize: 12 }}>{r.token}</div>
          <div style={{ ...S.mono, fontSize: 11, color: '#666' }}>{vals[r.token] || '…'}</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>{r.figma}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{r.usage}</div>
        </div>
      ))}
    </div>
  );
}

export function TypeTokens() {
  const roles = [
    { prefix: 'cell', figma: 'Accounting/body/small', usage: 'Data cells (tabular lining figures on numerics)' },
    { prefix: 'header', figma: 'Accounting/label/medium', usage: 'Column headers, chips' },
    { prefix: 'label-lg', figma: 'Accounting/label/large', usage: 'Buttons, bulk actions, pagination' },
    { prefix: 'badge', figma: 'Accounting/label/small', usage: 'Status badges' },
    { prefix: 'input', figma: 'Accounting/body/medium', usage: 'Search and select inputs' }
  ];
  const names = roles.flatMap((r) => [`--type-${r.prefix}-size`, `--type-${r.prefix}-lh`, `--type-${r.prefix}-track`]);
  const vals = useRootTokens(names);
  return (
    <table style={S.table}>
      <thead>
        <tr>
          <th style={S.th}>Sample</th>
          <th style={S.th}>Tokens</th>
          <th style={S.th}>Resolved (live)</th>
          <th style={S.th}>Figma style</th>
          <th style={S.th}>Usage</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((r) => (
          <tr key={r.prefix}>
            <td style={S.td}>
              <span
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: `var(--type-${r.prefix}-size)`,
                  lineHeight: `var(--type-${r.prefix}-lh)`,
                  letterSpacing: `var(--type-${r.prefix}-track)`,
                  fontWeight: r.prefix === 'cell' || r.prefix === 'input' ? 400 : 500,
                  fontVariantNumeric: 'tabular-nums lining-nums'
                }}
              >
                1,234,567.89
              </span>
            </td>
            <td style={{ ...S.td, ...S.mono }}>--type-{r.prefix}-*</td>
            <td style={{ ...S.td, ...S.mono }}>
              {vals[`--type-${r.prefix}-size`] || '…'}/{vals[`--type-${r.prefix}-lh`] || '…'} · {vals[`--type-${r.prefix}-track`] || '…'}
            </td>
            <td style={S.td}>{r.figma}</td>
            <td style={S.td}>{r.usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DensityTokens() {
  const modes = ['compact', 'standard', 'comfortable'];
  const tokens = ['--dg-row-h', '--dg-header-h', '--dg-pad-x', '--dg-pad-y'];
  const refs = { compact: useRef(null), standard: useRef(null), comfortable: useRef(null) };
  const [vals, setVals] = useState({});
  useLayoutEffect(() => {
    const out = {};
    for (const m of modes) {
      const el = refs[m].current;
      if (!el) continue;
      const cs = getComputedStyle(el);
      out[m] = {};
      for (const t of tokens) out[m][t] = cs.getPropertyValue(t).trim();
    }
    setVals(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const figma = {
    '--dg-row-h': 'density/row-height',
    '--dg-header-h': 'density/header-height',
    '--dg-pad-x': 'density/cell-padding-x',
    '--dg-pad-y': 'density/cell-padding-y'
  };
  return (
    <>
      {/* hidden probes carrying the density modes */}
      {modes.map((m) => (
        <div key={m} ref={refs[m]} className="dg" data-density={m} style={{ display: 'none' }} />
      ))}
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>CSS custom property</th>
            <th style={S.th}>Compact</th>
            <th style={S.th}>Standard</th>
            <th style={S.th}>Comfortable</th>
            <th style={S.th}>Figma variable</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t}>
              <td style={{ ...S.td, ...S.mono }}>{t}</td>
              {modes.map((m) => (
                <td key={m} style={{ ...S.td, ...S.mono }}>{vals[m]?.[t] || '…'}</td>
              ))}
              <td style={S.td}>{figma[t]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
