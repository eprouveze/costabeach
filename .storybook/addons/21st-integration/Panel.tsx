import React, { useState, useEffect } from 'react';
import { useAddonState, useChannel } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import { EVENTS } from './constants';

interface Component21st {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  preview?: string;
}

export const TwentyFirstPanel: React.FC = () => {
  const [components, setComponents] = useState<Component21st[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component21st | null>(null);

  const emit = useChannel({
    [EVENTS.SEARCH_RESULTS]: (results: Component21st[]) => {
      setComponents(results);
      setLoading(false);
    },
    [EVENTS.COMPONENT_RECEIVED]: (component: Component21st) => {
      setSelectedComponent(component);
      setLoading(false);
    },
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearchQuery(query);
    
    // Emit event to trigger MCP 21st component search
    emit(EVENTS.SEARCH_COMPONENTS, { query });
  };

  const handleComponentSelect = (component: Component21st) => {
    setLoading(true);
    emit(EVENTS.REQUEST_COMPONENT, { componentId: component.id });
  };

  return (
    <AddonPanel>
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>21st.dev Components</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search components (e.g., button, form, modal)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {components.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#555' }}>Search Results</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {components.map((component) => (
                <div
                  key={component.id}
                  onClick={() => handleComponentSelect(component)}
                  style={{
                    padding: '8px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#fafafa',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{component.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{component.category}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {component.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedComponent && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#555' }}>
              {selectedComponent.name} - Code
            </h4>
            <div
              style={{
                backgroundColor: '#f8f8f8',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                maxHeight: '300px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedComponent.code}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigator.clipboard.writeText(selectedComponent.code)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Copy Code
              </button>
              <button
                onClick={() => setSelectedComponent(null)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {components.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            Search for components from 21st.dev to explore and integrate them into your project.
          </div>
        )}
      </div>
    </AddonPanel>
  );
}; 