import { addons, types } from '@storybook/manager-api';
import { ADDON_ID, PANEL_ID, TOOL_ID } from './constants';
import { TwentyFirstPanel } from './Panel';
import { TwentyFirstTool } from './Tool';

addons.register(ADDON_ID, () => {
  // Add a panel for 21st.dev component exploration
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: '21st.dev Components',
    match: ({ viewMode }) => viewMode === 'story',
    render: TwentyFirstPanel,
  });

  // Add a toolbar tool for quick component search
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Search 21st.dev',
    match: ({ viewMode }) => viewMode === 'story',
    render: TwentyFirstTool,
  });
}); 