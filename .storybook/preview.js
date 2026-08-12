import '../src/DataGrid/tokens.css';

export default {
  parameters: {
    options: {
      storySort: {
        order: ['Data Grid', ['Design Tokens', 'DataGrid', 'Accessibility']]
      }
    },
    controls: { expanded: true },
    docs: { toc: true },
    a11y: {
      // Surface violations in the a11y panel without failing the build
      test: 'todo'
    }
  }
};
