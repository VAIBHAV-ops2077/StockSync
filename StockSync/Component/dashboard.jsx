import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3001/api';

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        // If no products exist, set empty array
        setProducts([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Using offline mode.');
      // Fallback to sample data if backend is not available
      setProducts([
        { _id: '1', name: 'iPhone 15', sku: 'IP15-001', currentStock: 25, safetyStock: 10, location: 'A1-001' },
        { _id: '2', name: 'Samsung Galaxy S24', sku: 'SG24-002', currentStock: 8, safetyStock: 15, location: 'A1-002' },
        { _id: '3', name: 'MacBook Pro 14"', sku: 'MBP14-003', currentStock: 5, safetyStock: 8, location: 'B2-001' },
        { _id: '4', name: 'iPad Air', sku: 'IPA-004', currentStock: 18, safetyStock: 12, location: 'A1-003' },
        { _id: '5', name: 'AirPods Pro', sku: 'APP-005', currentStock: 2, safetyStock: 20, location: 'C1-001' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    currentStock: 0,
    safetyStock: 0,
    location: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  // Get stock status and color
  const getStockStatus = (current, safety) => {
    if (current === 0) return { status: 'Out of Stock', color: '#ef4444', bgColor: '#fecaca' };
    if (current <= safety) return { status: 'Low Stock', color: '#f59e0b', bgColor: '#fed7aa' };
    return { status: 'In Stock', color: '#10b981', bgColor: '#bbf7d0' };
  };

  // Add new product to backend
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.sku) {
      try {
        const productData = {
          ...newProduct,
          currentStock: parseInt(newProduct.currentStock) || 0,
          safetyStock: parseInt(newProduct.safetyStock) || 0
        };

        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          const savedProduct = await response.json();
          setProducts([...products, savedProduct]);
          setNewProduct({ name: '', sku: '', currentStock: 0, safetyStock: 0, location: '' });
          setShowAddForm(false);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to add product');
        }
      } catch (err) {
        console.error('Error adding product:', err);
        setError('Failed to add product. Please check your connection.');
      }
    }
  };

  // Update stock quantity via backend API
  const updateStock = async (id, change) => {
    const product = products.find(p => (p._id || p.id) === id);
    if (!product) return;

    const newStock = Math.max(0, product.currentStock + change);
    const movementType = change > 0 ? 'IN' : 'OUT';
    const quantity = Math.abs(change);

    try {
      // Create stock movement in backend
      const response = await fetch(`${API_BASE_URL}/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id || product.id,
          type: movementType,
          quantity: quantity
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Update the product in the local state with the updated stock from backend
        setProducts(products.map(p => 
          (p._id || p.id) === id 
            ? { ...p, currentStock: result.product.currentStock }
            : p
        ));
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update stock');
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      // Fallback to local update if backend fails
      setProducts(products.map(p => 
        (p._id || p.id) === id 
          ? { ...p, currentStock: newStock }
          : p
      ));
      setError('Stock updated locally - backend connection failed');
    }
  };

  // Remove product (local only - no backend delete endpoint yet)
  const removeProduct = (id) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(products.filter(product => (product._id || product.id) !== id));
    }
  };

  const styles = {
    container: {
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      padding: 'clamp(16px, 3vw, 24px)',
      paddingTop: 'clamp(20px, 4vw, 32px)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflow: 'visible',
      position: 'relative'
    },
    header: {
      marginBottom: 'clamp(16px, 4vw, 32px)',
      textAlign: 'center',
      paddingTop: 'clamp(8px, 2vw, 16px)',
      position: 'relative',
      zIndex: 1
    },
    title: {
      fontSize: 'clamp(24px, 5vw, 40px)',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '8px',
      margin: '0 0 8px 0',
      lineHeight: '1.2'
    },
    subtitle: {
      color: '#64748b',
      fontSize: 'clamp(14px, 2.5vw, 18px)',
      margin: 0,
      lineHeight: '1.4'
    },
    errorSubtitle: {
      color: '#dc2626',
      fontSize: 'clamp(14px, 2.5vw, 18px)',
      margin: 0,
      lineHeight: '1.4',
      backgroundColor: '#fee2e2',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #fecaca'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 'clamp(12px, 2vw, 24px)',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: 'clamp(16px, 3vw, 24px)',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: 'clamp(20px, 4vw, 32px)',
      fontWeight: '700',
      marginBottom: '4px'
    },
    statLabel: {
      color: '#64748b',
      fontSize: 'clamp(12px, 2vw, 16px)',
      fontWeight: '500'
    },
    addButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)',
      borderRadius: '8px',
      fontSize: 'clamp(12px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '20px',
      width: '100%',
      maxWidth: '200px',
      transition: 'all 0.2s ease'
    },
    productGrid: {
      display: 'grid',
      gap: '16px'
    },
    productCard: {
      backgroundColor: 'white',
      padding: 'clamp(16px, 3vw, 24px)',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      '@media (min-width: 768px)': {
        flexDirection: 'row',
        alignItems: 'center'
      }
    },
    productInfo: {
      flex: 1,
      minWidth: 0
    },
    productName: {
      fontSize: 'clamp(16px, 3vw, 20px)',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px',
      wordBreak: 'break-word'
    },
    productDetails: {
      color: '#64748b',
      fontSize: 'clamp(12px, 2vw, 14px)',
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    stockStatus: {
      display: 'inline-block',
      padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
      borderRadius: '20px',
      fontSize: 'clamp(10px, 1.5vw, 12px)',
      fontWeight: '600'
    },
    stockControls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'clamp(8px, 2vw, 16px)',
      flexWrap: 'wrap'
    },
    stockNumber: {
      fontSize: 'clamp(20px, 4vw, 28px)',
      fontWeight: '700',
      color: '#1e293b',
      minWidth: 'clamp(40px, 8vw, 60px)',
      textAlign: 'center'
    },
    controlButton: {
      backgroundColor: '#f1f5f9',
      border: '1px solid #e2e8f0',
      width: 'clamp(36px, 8vw, 44px)',
      height: 'clamp(36px, 8vw, 44px)',
      borderRadius: '8px',
      fontSize: 'clamp(16px, 3vw, 20px)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      touchAction: 'manipulation'
    },
    removeButton: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
      borderRadius: '6px',
      fontSize: 'clamp(10px, 1.5vw, 12px)',
      cursor: 'pointer',
      marginTop: '8px',
      transition: 'all 0.2s ease',
      touchAction: 'manipulation'
    },
    form: {
      backgroundColor: 'white',
      padding: 'clamp(16px, 3vw, 24px)',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      marginBottom: '20px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 'clamp(12px, 2vw, 16px)',
      marginBottom: '16px'
    },
    input: {
      width: '100%',
      padding: 'clamp(10px, 2vw, 14px)',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: 'clamp(14px, 2vw, 16px)',
      boxSizing: 'border-box'
    },
    label: {
      display: 'block',
      fontSize: 'clamp(12px, 2vw, 14px)',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '4px'
    },
    formButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      '@media (min-width: 480px)': {
        flexDirection: 'row'
      }
    },
    cancelButton: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)',
      borderRadius: '8px',
      fontSize: 'clamp(12px, 2vw, 16px)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.currentStock <= p.safetyStock && p.currentStock > 0).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + p.currentStock, 0);

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '18px', color: '#64748b'}}>Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Stock Management</h1>
        {error ? (
          <p style={styles.errorSubtitle}>⚠️ {error}</p>
        ) : (
          <p style={styles.subtitle}>Monitor and manage your product inventory</p>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statNumber, color: '#3b82f6'}}>{totalProducts}</div>
          <div style={styles.statLabel}>Total Products</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statNumber, color: '#10b981'}}>{totalStockValue}</div>
          <div style={styles.statLabel}>Total Stock Units</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statNumber, color: '#f59e0b'}}>{lowStockCount}</div>
          <div style={styles.statLabel}>Low Stock Alerts</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statNumber, color: '#ef4444'}}>{outOfStockCount}</div>
          <div style={styles.statLabel}>Out of Stock</div>
        </div>
      </div>

      {/* Add Product Button */}
      <button 
        style={styles.addButton}
        onClick={() => setShowAddForm(!showAddForm)}
      >
        {showAddForm ? 'Cancel' : '+ Add New Product'}
      </button>

      {/* Add Product Form */}
      {showAddForm && (
        <form style={styles.form} onSubmit={handleAddProduct}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Product Name</label>
              <input
                style={styles.input}
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label style={styles.label}>SKU</label>
              <input
                style={styles.input}
                type="text"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                placeholder="Enter SKU"
                required
              />
            </div>
            <div>
              <label style={styles.label}>Current Stock</label>
              <input
                style={styles.input}
                type="number"
                value={newProduct.currentStock}
                onChange={(e) => setNewProduct({...newProduct, currentStock: e.target.value})}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label style={styles.label}>Safety Stock Level</label>
              <input
                style={styles.input}
                type="number"
                value={newProduct.safetyStock}
                onChange={(e) => setNewProduct({...newProduct, safetyStock: e.target.value})}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label style={styles.label}>Location</label>
              <input
                style={styles.input}
                type="text"
                value={newProduct.location}
                onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                placeholder="Enter location"
              />
            </div>
          </div>
          <div style={{
            ...styles.formButtons,
            flexDirection: windowWidth <= 480 ? 'column' : 'row'
          }}>
            <button type="submit" style={{...styles.addButton, maxWidth: 'none'}}>Add Product</button>
            <button 
              type="button" 
              style={styles.cancelButton}
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products List */}
      <div style={styles.productGrid}>
        {products.map(product => {
          const stockInfo = getStockStatus(product.currentStock, product.safetyStock);
          const isMobile = windowWidth <= 768;
          const productId = product._id || product.id;
          
          return (
            <div key={productId} style={{
              ...styles.productCard,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center'
            }}>
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDetails}>
                  SKU: {product.sku} • Location: {product.location} • Safety Level: {product.safetyStock}
                </p>
                <span 
                  style={{
                    ...styles.stockStatus,
                    color: stockInfo.color,
                    backgroundColor: stockInfo.bgColor
                  }}
                >
                  {stockInfo.status}
                </span>
              </div>
              <div style={{
                ...styles.stockControls,
                justifyContent: isMobile ? 'space-between' : 'center',
                marginTop: isMobile ? '12px' : '0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
                  <button 
                    style={{
                      ...styles.controlButton, 
                      backgroundColor: '#fee2e2',
                      opacity: product.currentStock === 0 ? 0.5 : 1
                    }}
                    onClick={() => updateStock(productId, -1)}
                    disabled={product.currentStock === 0}
                  >
                    −
                  </button>
                  <span style={styles.stockNumber}>{product.currentStock}</span>
                  <button 
                    style={{...styles.controlButton, backgroundColor: '#dcfce7'}}
                    onClick={() => updateStock(productId, 1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  style={styles.removeButton}
                  onClick={() => removeProduct(productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;