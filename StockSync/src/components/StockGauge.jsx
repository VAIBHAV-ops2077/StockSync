import React, { useState, useEffect } from 'react';

function StockGauge({ totalProducts, lowStockCount, outOfStockCount, isRealTime }) {
  const [animatedValues, setAnimatedValues] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    // Animate values when they change
    const animateValue = (start, end, setter) => {
      const duration = 1000;
      const increment = (end - start) / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          current = end;
          clearInterval(timer);
        }
        setter(Math.round(current));
      }, 16);
    };

    animateValue(animatedValues.total, totalProducts, (val) => 
      setAnimatedValues(prev => ({ ...prev, total: val }))
    );
    animateValue(animatedValues.lowStock, lowStockCount, (val) => 
      setAnimatedValues(prev => ({ ...prev, lowStock: val }))
    );
    animateValue(animatedValues.outOfStock, outOfStockCount, (val) => 
      setAnimatedValues(prev => ({ ...prev, outOfStock: val }))
    );
  }, [totalProducts, lowStockCount, outOfStockCount]);

  const healthScore = totalProducts > 0 ? 
    Math.round(((totalProducts - outOfStockCount - lowStockCount) / totalProducts) * 100) : 0;

  const getHealthColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const styles = {
    container: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      border: '1px solid #334155',
      position: 'relative'
    },
    realTimeIndicator: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#10b981',
      fontWeight: '500'
    },
    pulsingDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#10b981',
      borderRadius: '50%',
      animation: 'pulse 1.5s infinite'
    },
    gaugeContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20px'
    },
    circularGauge: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      background: `conic-gradient(
        ${getHealthColor(healthScore)} 0deg ${healthScore * 3.6}deg,
        #e2e8f0 ${healthScore * 3.6}deg 360deg
      )`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    innerCircle: {
      width: '90px',
      height: '90px',
      backgroundColor: '#1e293b',
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    healthScore: {
      fontSize: '24px',
      fontWeight: '700',
      color: getHealthColor(healthScore),
      lineHeight: '1'
    },
    healthLabel: {
      fontSize: '10px',
      color: '#94a3b8',
      textTransform: 'uppercase',
      fontWeight: '500'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginTop: '20px'
    },
    metricCard: {
      textAlign: 'center',
      padding: '12px 8px',
      borderRadius: '8px',
      border: '1px solid #475569',
      backgroundColor: '#334155'
    },
    metricValue: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '4px'
    },
    metricLabel: {
      fontSize: '12px',
      color: '#94a3b8',
      textTransform: 'uppercase',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      
      <h3 style={{ marginBottom: '20px', color: '#f1f5f9' }}>📊 Stock Health</h3>
      
      {isRealTime && (
        <div style={styles.realTimeIndicator}>
          <div style={styles.pulsingDot}></div>
          LIVE
        </div>
      )}

      <div style={styles.gaugeContainer}>
        <div style={styles.circularGauge}>
          <div style={styles.innerCircle}>
            <div style={styles.healthScore}>{healthScore}%</div>
            <div style={styles.healthLabel}>Health</div>
          </div>
        </div>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={{...styles.metricValue, color: '#3b82f6'}}>
            {animatedValues.total}
          </div>
          <div style={styles.metricLabel}>Total Items</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={{...styles.metricValue, color: '#f59e0b'}}>
            {animatedValues.lowStock}
          </div>
          <div style={styles.metricLabel}>Low Stock</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={{...styles.metricValue, color: '#ef4444'}}>
            {animatedValues.outOfStock}
          </div>
          <div style={styles.metricLabel}>Out of Stock</div>
        </div>
      </div>
    </div>
  );
}

export default StockGauge;
