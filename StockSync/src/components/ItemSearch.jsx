import React, { useState, useEffect } from 'react';

function ItemSearch({ onItemSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:3001/api';

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const products = await response.json();
        const filtered = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      border: '1px solid #334155'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #475569',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '16px',
      outline: 'none',
      backgroundColor: '#334155',
      color: '#f1f5f9'
    },
    searchInputFocused: {
      borderColor: '#3b82f6'
    },
    resultItem: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #475569',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: '#334155'
    },
    resultItemHover: {
      backgroundColor: '#475569',
      borderColor: '#3b82f6'
    },
    itemName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#f1f5f9',
      marginBottom: '4px'
    },
    itemDetails: {
      fontSize: '14px',
      color: '#94a3b8'
    },
    noResults: {
      textAlign: 'center',
      color: '#94a3b8',
      padding: '20px',
      fontStyle: 'italic'
    },
    stockIndicator: {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '8px'
    }
  };

  const getStockColor = (current, safety) => {
    if (current === 0) return '#ef4444'; // Red
    if (current <= safety) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: '16px', color: '#f1f5f9' }}>🔍 Item Search</h3>
      <input
        type="text"
        placeholder="Search by name, SKU, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />
      
      {loading && <div style={{ textAlign: 'center', color: '#94a3b8' }}>Searching...</div>}
      
      {searchResults.length > 0 ? (
        <div>
          <h4 style={{ color: '#94a3b8', marginBottom: '12px' }}>
            Found {searchResults.length} items
          </h4>
          {searchResults.map(item => (
            <div
              key={item._id}
              style={styles.resultItem}
              onClick={() => onItemSelect && onItemSelect(item)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#475569';
                e.target.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#334155';
                e.target.style.borderColor = '#475569';
              }}
            >
              <div style={styles.itemName}>
                <span
                  style={{
                    ...styles.stockIndicator,
                    backgroundColor: getStockColor(item.currentStock, item.safetyStock)
                  }}
                ></span>
                {item.name}
              </div>
              <div style={styles.itemDetails}>
                SKU: {item.sku} • Stock: {item.currentStock} • Location: {item.location}
              </div>
            </div>
          ))}
        </div>
      ) : searchTerm.length > 2 && !loading ? (
        <div style={styles.noResults}>No items found matching "{searchTerm}"</div>
      ) : null}
    </div>
  );
}

export default ItemSearch;
