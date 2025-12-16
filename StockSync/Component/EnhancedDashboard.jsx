import React, { useState, useEffect } from 'react';
import StockGauge from '../src/components/StockGauge';
import ItemSearch from '../src/components/ItemSearch';
import ShipmentQueue from '../src/components/ShipmentQueue';
import BarcodeScanner from '../src/components/BarcodeScanner';
import { useWebSocket } from '../src/components/WebSocketProvider';

function EnhancedDashboard() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { socket, isConnected, emitStockUpdate } = useWebSocket();
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

  // Listen for real-time stock updates
  useEffect(() => {
    const handleStockUpdate = (event) => {
      const { productId, newStock } = event.detail;
      setProducts(prev => prev.map(product => 
        (product._id || product.id) === productId 
          ? { ...product, currentStock: newStock }
          : product
      ));
    };

    const handleBarcodeScan = (event) => {
      const { barcode } = event.detail;
      const matchedProduct = products.find(p => p.sku === barcode);
      if (matchedProduct) {
        setSelectedItem(matchedProduct);
      }
    };

    window.addEventListener('stockUpdate', handleStockUpdate);
    window.addEventListener('barcodeScan', handleBarcodeScan);

    return () => {
      window.removeEventListener('stockUpdate', handleStockUpdate);
      window.removeEventListener('barcodeScan', handleBarcodeScan);
    };
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setProducts([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Using offline mode.');
      // Fallback sample data
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

  const getStockStatus = (current, safety) => {
    if (current === 0) return { status: 'Out of Stock', color: '#ef4444', bgColor: '#fecaca' };
    if (current <= safety) return { status: 'Low Stock', color: '#f59e0b', bgColor: '#fed7aa' };
    return { status: 'In Stock', color: '#10b981', bgColor: '#bbf7d0' };
  };

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

  const updateStock = async (id, change) => {
    const product = products.find(p => (p._id || p.id) === id);
    if (!product) return;

    const newStock = Math.max(0, product.currentStock + change);
    const movementType = change > 0 ? 'IN' : 'OUT';
    const quantity = Math.abs(change);

    try {
      const response = await fetch(`${API_BASE_URL}/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id || product.id,
          type: movementType,
          quantity: quantity,
          notes: `${movementType === 'IN' ? 'Added' : 'Removed'} ${quantity} units via dashboard`
        })
      });

      if (response.ok) {
        // Update local state
        setProducts(products.map(p => 
          (p._id || p.id) === id 
            ? { ...p, currentStock: newStock }
            : p
        ));
        
        // Emit WebSocket update for real-time sync
        emitStockUpdate(product._id || product.id, newStock);
        
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update stock');
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock. Please check your connection.');
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProducts(products.filter(p => (p._id || p.id) !== id));
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please check your connection.');
      }
    }
  };

  // Calculate stats for StockGauge
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= p.safetyStock).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: `clamp(12px, 2vw, 20px)`,
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: `clamp(20px, 4vw, 32px)`,
      color: '#f1f5f9'
    },
    title: {
      fontSize: `clamp(24px, 5vw, 32px)`,
      fontWeight: '700',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: `clamp(14px, 3vw, 16px)`,
      color: '#94a3b8',
      marginBottom: '16px'
    },
    connectionStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: isConnected ? '#dcfce7' : '#fee2e2',
      color: isConnected ? '#16a34a' : '#dc2626'
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? '1fr' 
        : isTablet 
          ? 'repeat(2, 1fr)' 
          : 'repeat(3, 1fr)',
      gap: `clamp(16px, 3vw, 24px)`,
      marginBottom: `clamp(24px, 4vw, 32px)`
    },
    inventorySection: {
      gridColumn: isMobile ? '1' : isTablet ? 'span 2' : 'span 3'
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: `clamp(16px, 3vw, 24px)`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      border: '1px solid #334155'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    cardTitle: {
      fontSize: `clamp(18px, 4vw, 20px)`,
      fontWeight: '600',
      color: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    addButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
          <div style={{ color: '#94a3b8' }}>Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          📊 Inventory Dashboard
        </h1>
        <p style={styles.subtitle}>Real-time stock management system</p>
        <div style={styles.connectionStatus}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#16a34a' : '#dc2626'
          }}></div>
          {isConnected ? 'Live Connection' : 'Offline Mode'}
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#7f1d1d',
          color: '#fca5a5',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #991b1b'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={styles.dashboardGrid}>
        <StockGauge 
          totalProducts={totalProducts}
          lowStockCount={lowStockCount}
          outOfStockCount={outOfStockCount}
          isRealTime={isConnected}
        />

        <ItemSearch 
          onItemSelect={(item) => {
            setSelectedItem(item);
            console.log('Item selected:', item);
          }}
        />

        <BarcodeScanner 
          onScan={(scanData) => {
            if (scanData.product) {
              setSelectedItem(scanData.product);
            }
            console.log('Barcode scanned:', scanData);
          }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: `clamp(16px, 3vw, 24px)`,
        marginBottom: `clamp(24px, 4vw, 32px)`
      }}>
        <ShipmentQueue />
      </div>

      {selectedItem && (
        <div style={{
          ...styles.card,
          marginBottom: '24px',
          border: '2px solid #3b82f6',
          backgroundColor: '#1e3a8a20'
        }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              🎯 Selected Item: {selectedItem.name}
            </h3>
            <button 
              onClick={() => setSelectedItem(null)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#94a3b8'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', color: '#e2e8f0' }}>
            <div><strong>SKU:</strong> {selectedItem.sku}</div>
            <div><strong>Stock:</strong> {selectedItem.currentStock}</div>
            <div><strong>Location:</strong> {selectedItem.location}</div>
            <div><strong>Safety Stock:</strong> {selectedItem.safetyStock}</div>
          </div>
        </div>
      )}

      <div style={{...styles.card, ...styles.inventorySection}}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            📦 Product Inventory
          </h2>
          <button
            style={styles.addButton}
            onClick={() => setShowAddForm(!showAddForm)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddProduct} style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#334155', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                style={{ padding: '10px', border: '1px solid #475569', borderRadius: '6px', backgroundColor: '#475569', color: '#f1f5f9', '::placeholder': { color: '#94a3b8' } }}
                required
              />
              <input
                type="text"
                placeholder="SKU"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                style={{ padding: '10px', border: '1px solid #475569', borderRadius: '6px', backgroundColor: '#475569', color: '#f1f5f9' }}
                required
              />
              <input
                type="number"
                placeholder="Current Stock"
                value={newProduct.currentStock}
                onChange={(e) => setNewProduct({...newProduct, currentStock: e.target.value})}
                style={{ padding: '10px', border: '1px solid #475569', borderRadius: '6px', backgroundColor: '#475569', color: '#f1f5f9' }}
              />
              <input
                type="number"
                placeholder="Safety Stock"
                value={newProduct.safetyStock}
                onChange={(e) => setNewProduct({...newProduct, safetyStock: e.target.value})}
                style={{ padding: '10px', border: '1px solid #475569', borderRadius: '6px', backgroundColor: '#475569', color: '#f1f5f9' }}
              />
              <input
                type="text"
                placeholder="Location"
                value={newProduct.location}
                onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                style={{ padding: '10px', border: '1px solid #475569', borderRadius: '6px', backgroundColor: '#475569', color: '#f1f5f9', gridColumn: isMobile ? '1' : 'span 2' }}
              />
            </div>
            <button type="submit" style={{...styles.addButton, marginRight: '8px'}}>Add Product</button>
          </form>
        )}

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
            No products found. Add your first product to get started!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {products.map((product) => {
              const stockInfo = getStockStatus(product.currentStock, product.safetyStock);
              return (
                <div
                  key={product._id || product.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile 
                      ? '1fr' 
                      : isTablet 
                        ? '2fr 1fr 1fr 120px' 
                        : '2fr 1fr 1fr 1fr 120px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#334155',
                    borderRadius: '8px',
                    border: '1px solid #475569'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f1f5f9' }}>{product.name}</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                      SKU: {product.sku} | Location: {product.location}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>{product.currentStock}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Current</div>
                  </div>
                  
                  <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                    <div style={{ fontSize: '14px', color: '#e2e8f0' }}>{product.safetyStock}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Safety</div>
                  </div>

                  {!isMobile && (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: stockInfo.bgColor,
                        color: stockInfo.color
                      }}>
                        {stockInfo.status}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '6px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
                    <button
                      onClick={() => updateStock(product._id || product.id, -1)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateStock(product._id || product.id, 1)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id || product.id)}
                      style={{
                        backgroundColor: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedDashboard;
