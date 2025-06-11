export const ADDON_ID = 'twentyfirst-integration';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const TOOL_ID = `${ADDON_ID}/tool`;
export const EVENTS = {
  REQUEST_COMPONENT: `${ADDON_ID}/request-component`,
  COMPONENT_RECEIVED: `${ADDON_ID}/component-received`,
  SEARCH_COMPONENTS: `${ADDON_ID}/search-components`,
  SEARCH_RESULTS: `${ADDON_ID}/search-results`,
} as const; 