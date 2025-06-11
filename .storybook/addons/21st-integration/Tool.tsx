import React, { useState } from 'react';
import { useChannel } from '@storybook/manager-api';
import { IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';
import { SearchIcon } from '@storybook/icons';
import { EVENTS } from './constants';

export const TwentyFirstTool: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  const emit = useChannel({});

  const commonComponents = [
    { id: 'button', title: 'Button Components', onClick: () => handleQuickSearch('button') },
    { id: 'form', title: 'Form Components', onClick: () => handleQuickSearch('form') },
    { id: 'modal', title: 'Modal Components', onClick: () => handleQuickSearch('modal') },
    { id: 'navigation', title: 'Navigation Components', onClick: () => handleQuickSearch('navigation') },
    { id: 'card', title: 'Card Components', onClick: () => handleQuickSearch('card') },
    { id: 'table', title: 'Table Components', onClick: () => handleQuickSearch('table') },
  ];

  const handleQuickSearch = (query: string) => {
    emit(EVENTS.SEARCH_COMPONENTS, { query });
    setIsOpen(false);
  };

  return (
    <WithTooltip
      placement="top"
      trigger="click"
      closeOnOutsideClick
      open={isOpen}
      onVisibilityChange={setIsOpen}
      tooltip={
        <TooltipLinkList
          links={[
            {
              id: 'search-input',
              title: 'Custom Search',
              center: (
                <div style={{ padding: '8px' }}>
                  <input
                    type="text"
                    placeholder="Search 21st.dev components..."
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickSearch(quickSearchQuery);
                      }
                    }}
                    style={{
                      width: '200px',
                      padding: '6px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                </div>
              ),
            },
            ...commonComponents,
          ]}
        />
      }
    >
      <IconButton
        key="twentyfirst-search"
        title="Search 21st.dev Components"
        active={isOpen}
      >
        <SearchIcon />
      </IconButton>
    </WithTooltip>
  );
}; 