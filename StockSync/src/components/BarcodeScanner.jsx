import React, { useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketProvider';

function BarcodeScanner({ onScan }) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [products, setProducts] = useState([]);

  const { socket, emitBarcodeScan } = useWebSocket();
  const API_BASE_URL = 'http://localhost:3001/api';

  useEffect(() => {
    // Fetch products for barcode matching
    fetchProducts();
  }, []);

  useEffect(() => {
    // Listen for barcode scans from other sources
    const handleBarcodeScan = (event) => {
      const { barcode, timestamp } = event.detail;
      addToScanHistory(barcode, timestamp);
    };

    window.addEventListener('barcodeScan', handleBarcodeScan);
    return () => window.removeEventListener('barcodeScan', handleBarcodeScan);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToScanHistory = (barcode, timestamp = new Date()) => {
    const product = products.find(p => p.sku === barcode);
    const scanRecord = {
      id: Date.now(),
      barcode,
      timestamp,
      product: product || null,
      matched: !!product
    };

    setScanHistory(prev => [scanRecord, ...prev.slice(0, 19)]); // Keep last 20 scans
    
    if (onScan) {
      onScan(scanRecord);
    }
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      emitBarcodeScan(manualBarcode.trim());
      addToScanHistory(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const simulateBarcodeScan = (sku) => {
    emitBarcodeScan(sku);
    addToScanHistory(sku);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const styles = {
    container: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      border: '1px solid #334155'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    scannerStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    statusIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: isScanning ? '#10b981' : '#64748b'
    },
    scanForm: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px'
    },
    barcodeInput: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #475569',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#334155',
      color: '#f1f5f9'
    },
    scanButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    quickScanSection: {
      marginBottom: '20px'
    },
    quickScanGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '8px',
      marginTop: '12px'
    },
    quickScanButton: {
      backgroundColor: '#334155',
      border: '1px solid #475569',
      borderRadius: '6px',
      padding: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      textAlign: 'center',
      transition: 'all 0.2s',
      color: '#f1f5f9'
    },
    historySection: {
      marginTop: '24px'
    },
    historyItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '6px',
      marginBottom: '4px',
      fontSize: '14px'
    },
    matchedItem: {
      backgroundColor: '#dcfce7',
      border: '1px solid #bbf7d0'
    },
    unmatchedItem: {
      backgroundColor: '#fee2e2',
      border: '1px solid #fecaca'
    },
    timestamp: {
      fontSize: '12px',
      color: '#94a3b8'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0, color: '#f1f5f9' }}>📷 Barcode Scanner</h3>
        <div style={styles.scannerStatus}>
          <div style={styles.statusIndicator}></div>
          {isScanning ? 'Scanning Active' : 'Manual Mode'}
        </div>
      </div>

      <form onSubmit={handleManualScan} style={styles.scanForm}>
        <input
          type="text"
          placeholder="Enter barcode or SKU..."
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          style={styles.barcodeInput}
        />
        <button type="submit" style={styles.scanButton}>
          Scan
        </button>
      </form>

      <div style={styles.quickScanSection}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#94a3b8' }}>
          Quick Scan Products:
        </h4>
        <div style={styles.quickScanGrid}>
          {products.slice(0, 6).map(product => (
            <button
              key={product._id}
              style={styles.quickScanButton}
              onClick={() => simulateBarcodeScan(product.sku)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#475569';
                e.target.style.borderColor = '#64748b';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#334155';
                e.target.style.borderColor = '#475569';
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                {product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name}
              </div>
              <div style={{ color: '#94a3b8' }}>{product.sku}</div>
            </button>
          ))}
        </div>
      </div>

      {scanHistory.length > 0 && (
        <div style={styles.historySection}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#94a3b8' }}>
            Recent Scans ({scanHistory.length})
          </h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {scanHistory.map(scan => (
              <div
                key={scan.id}
                style={{
                  ...styles.historyItem,
                  ...(scan.matched ? styles.matchedItem : styles.unmatchedItem)
                }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>
                    {scan.matched ? scan.product.name : scan.barcode}
                  </div>
                  {scan.matched && (
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {scan.barcode} • Stock: {scan.product.currentStock}
                    </div>
                  )}
                </div>
                <div style={styles.timestamp}>
                  {formatTimestamp(scan.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scanHistory.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#94a3b8', 
          padding: '20px',
          fontStyle: 'italic'
        }}>
          No scans yet. Enter a barcode above or click a product to test.
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
