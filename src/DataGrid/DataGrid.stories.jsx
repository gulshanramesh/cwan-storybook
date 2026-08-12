import { expect, screen, userEvent, within } from 'storybook/test';
import { DataGrid } from './DataGrid.jsx';
import { columns, data } from './sampleData.js';

/**
 * Accounting DataGrid — the Storybook mirror of the Figma "Complete DG"
 * component set. Every control below maps 1:1 to a Figma component property;
 * the mapping is recorded in each control's description.
 */
export default {
  title: 'Data Grid/DataGrid',
  component: DataGrid,
  tags: ['autodocs'],
  args: {
    columns,
    data,
    density: 'standard',
    zebra: true,
    sortable: true,
    selectable: true,
    pagination: true,
    pageSize: 8,
    loading: false,
    filters: [],
    savedView: 'Saved View'
  },
  argTypes: {
    filters: {
      control: 'object',
      description:
        'Figma: Toolbar → State=Filters | No filters, with Filter Chip components. Chips are removable; "Clear all" empties the set.',
      table: { category: 'Figma properties' }
    },
    savedView: {
      control: 'text',
      description:
        'Figma: Toolbar → Saved View select. Interactive: opens a preset-view menu (filters/sort combinations); the Filters button opens grouped per-column value filters.',
      table: { category: 'Figma properties' }
    },
    density: {
      control: 'inline-radio',
      options: ['compact', 'standard', 'comfortable'],
      description:
        'Figma: Complete DG → Density variant, driven by the "Data Grid / Density" variable modes (row 32/40/48, header 36/44/48, padding 12·8/16·12/20·16).',
      table: { category: 'Figma properties' }
    },
    zebra: {
      control: 'boolean',
      description: 'Figma: Table Row → Zebra. Muted striping via Color/Row/Zebra (Surface Container Low).',
      table: { category: 'Figma properties' }
    },
    sortable: {
      control: 'boolean',
      description: 'Figma: Header Cell → Sortable boolean + Sorting variants (Default/Ascending/Descending).',
      table: { category: 'Figma properties' }
    },
    selectable: {
      control: 'boolean',
      description: 'Figma: Table Row → Checkbox boolean; enables the Bulk Actions pattern.',
      table: { category: 'Figma properties' }
    },
    pagination: {
      control: 'boolean',
      description: 'Figma: Table Footer → Type=Pagination | No Pagination.',
      table: { category: 'Figma properties' }
    },
    pageSize: {
      control: { type: 'number', min: 4, max: 50 },
      description: 'Rows per page when pagination is on.',
      table: { category: 'Data' }
    },
    columns: {
      control: 'object',
      description:
        'Column definitions: key, label, numeric, badge, sortable, filter, editable, currencyFrom, width, priority. Editable maps to Figma Row Cell → State=Editing | Error; filter maps to Header Cell → Filter; priority drives responsive auto-hiding. All columns are pointer-resizable via the header edge.',
      table: { category: 'Data' }
    },
    data: {
      control: 'object',
      description: 'Row objects. A negative balance renders in Color/Value/Negative.',
      table: { category: 'Data' }
    },
    loading: {
      control: 'boolean',
      description: 'State: skeleton rows while data loads.',
      table: { category: 'States' }
    }
  }
};

/** Standard density, zebra striping, sortable columns, pagination — the default Figma configuration. */
export const Standard = {};

/** Density variable mode: Compact (32px rows) — for 50+ row worksets. */
export const Compact = { args: { density: 'compact' } };

/** Density variable mode: Comfortable (48px rows) — custom +2 extension of M3's density scale. */
export const Comfortable = { args: { density: 'comfortable' } };

/** Read-only view: no checkbox column, no bulk actions (Figma: Table Row → Checkbox=false). */
export const WithoutSelection = { args: { selectable: false } };

/** Toolbar → State=Filters: removable filter chips with Clear all. */
export const FiltersApplied = {
  args: { filters: ['Status: Active', 'Type: Savings'], savedView: 'Q3 Review' }
};

/**
 * Built-in responsive behavior (Figma: Header Cell → Pin + Elevation/Frozen
 * Column): when the grid is narrower than the table, the first and last
 * columns pin automatically — identity stays visible on the left, row actions
 * on the right — with edge shadows only on sides hiding content.
 */
export const PinnedFirstColumn = {
  name: 'Sticky Columns (Narrow)',
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <DataGrid {...args} />
    </div>
  )
};

/**
 * Tablet width (Figma: Tablet / Prioritized columns): low-priority columns
 * auto-hide by column `priority` until the rest fit; core columns
 * (name, balance, status, account) never auto-hide.
 */
export const TabletView = {
  name: 'Tablet (768)',
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ maxWidth: 768 }}>
      <DataGrid {...args} />
    </div>
  )
};

/**
 * Mobile width (Figma: Mobile / Cards): below 640px the grid renders as a
 * card list — title + status badge + key fields — with search, filters,
 * selection, and pagination intact.
 */
export const MobileView = {
  name: 'Mobile (390)',
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ maxWidth: 390 }}>
      <DataGrid {...args} />
    </div>
  )
};

/** Loading state: skeleton rows. */
export const Loading = { args: { loading: true } };

/** Empty state: no rows to display. */
export const Empty = { args: { data: [] } };

/** Error state: row-level error treatment (Figma: Row Cell → State=Error / Color/Row/Error). */
export const ErrorState = {
  name: 'Error',
  args: {
    data: data.map((row) => (row.id === 'a8' ? { ...row, error: true } : row))
  }
};

/**
 * Interaction test: typing in search filters rows and the result count
 * (a live region) announces the change.
 */
export const SearchFiltering = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: /search accounts/i });
    await userEvent.type(search, 'savings');
    await expect(await canvas.findByText('5 of 12 accounts')).toBeInTheDocument();
    await expect(canvas.queryByText('Acme Corp')).not.toBeInTheDocument();
    await expect(canvas.getByText('Olivia Chen')).toBeInTheDocument();
  }
};

/**
 * Interaction test: clicking a column header toggles sort and updates
 * aria-sort so the state is announced to assistive tech.
 */
export const SortToggling = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('columnheader', { name: /customer name/i });
    const sortButton = within(header).getByRole('button');

    await userEvent.click(sortButton);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');

    await userEvent.click(sortButton);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  }
};

/**
 * Interaction test: inline editing (Figma: Row Cell → State=Editing | Error).
 * Double-click a Customer Name or Balance cell to edit; Enter commits,
 * Escape cancels. Invalid numeric input shows the Error cell state.
 */
export const InlineEditing = {
  name: 'Inline Editing (Name & Balance cells)',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Edit a text cell and commit
    await userEvent.dblClick(canvas.getByText('Acme Corp'));
    const nameInput = await canvas.findByRole('textbox', { name: /edit customer name/i });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Acme Corporation{Enter}');
    await expect(await canvas.findByText('Acme Corporation')).toBeInTheDocument();

    // Enter invalid numeric input → Error cell state
    await userEvent.dblClick(await canvas.findByText('$87,340.25'));
    const balanceInput = await canvas.findByRole('textbox', { name: /edit balance/i });
    await userEvent.clear(balanceInput);
    await userEvent.type(balanceInput, 'not a number{Enter}');
    await expect(balanceInput).toHaveAttribute('aria-invalid', 'true');

    // Escape cancels and restores the original value
    await userEvent.keyboard('{Escape}');
    await expect(await canvas.findByText('$87,340.25')).toBeInTheDocument();
  }
};

/**
 * Interaction test: column filtering (Figma: Header Cell → Filter + Filter Chip).
 * The Status funnel opens a value menu; checking a value filters rows and
 * adds a removable chip to the chips row.
 */
export const ColumnFiltering = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /filter status/i }));
    // the menu is portaled to <body>, outside the story canvas — query the screen
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Active' }));
    await expect(await canvas.findByText('9 of 12 accounts')).toBeInTheDocument();
    await expect(canvas.getByText('Status: Active')).toBeInTheDocument();
    await expect(canvas.queryByText('Marcus Johnson')).not.toBeInTheDocument();

    // removing the chip restores all rows
    await userEvent.click(canvas.getByRole('button', { name: /remove filter status: active/i }));
    await expect(await canvas.findByText('12 of 12 accounts')).toBeInTheDocument();
  }
};

/**
 * Interaction test: hiding a column via the Columns menu removes it
 * from the table.
 */
export const ColumnVisibility = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^columns$/i }));
    // the menu is portaled to <body>, outside the story canvas — query the screen
    await userEvent.click(await screen.findByRole('checkbox', { name: /country/i }));
    await expect(canvas.queryByRole('columnheader', { name: /country/i })).not.toBeInTheDocument();
  }
};
