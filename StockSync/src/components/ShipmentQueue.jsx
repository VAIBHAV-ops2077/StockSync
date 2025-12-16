import React, { useState, useEffect } from 'react';

function ShipmentQueue() {
  const [shipments, setShipments] = useState([
    {
      id: 'SH001',
      type: 'incoming',
      supplier: 'Tech Components Ltd',
      items: [
        { sku: 'TECH001', name: 'Wireless Mouse', quantity: 50 },
        { sku: 'TECH002', name: 'USB Cable', quantity: 100 }
      ],
      expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'SH002', 
      type: 'outgoing',
      customer: 'RetailCorp',
      items: [
        { sku: 'OFF001', name: 'Office Chair', quantity: 5 }
      ],
      expectedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'processing',
      priority: 'urgent'
    },
    {
      id: 'SH003',
      type: 'incoming',
      supplier: 'Office Supply Co',
      items: [
        { sku: 'OFF002', name: 'Desk Lamp', quantity: 25 },
        { sku: 'OFF003', name: 'Filing Cabinet', quantity: 10 }
      ],
      expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'confirmed',
      priority: 'medium'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const updateShipmentStatus = (shipmentId, newStatus) => {
    setShipments(prev => prev.map(shipment => 
      shipment.id === shipmentId 
        ? { ...shipment, status: newStatus }
        : shipment
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'delayed': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#64748b';
      default: return '#64748b';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysFromNow = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `In ${diffDays} days`;
  };

  const filteredShipments = filter === 'all' 
    ? shipments 
    : shipments.filter(s => s.type === filter);

  const styles = {
    container: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      border: '1px solid #334155'
    },
    filterTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      borderBottom: '1px solid #475569',
      paddingBottom: '16px'
    },
    filterTab: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    activeTab: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    inactiveTab: {
      color: '#94a3b8',
      backgroundColor: '#334155'
    },
    shipmentCard: {
      border: '1px solid #475569',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.2s',
      backgroundColor: '#334155'
    },
    shipmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    shipmentId: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#f1f5f9'
    },
    typeIndicator: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'uppercase'
    },
    incomingType: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    outgoingType: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    shipmentDetails: {
      fontSize: '14px',
      color: '#e2e8f0',
      marginBottom: '8px'
    },
    itemsList: {
      fontSize: '12px',
      color: '#94a3b8',
      marginBottom: '12px'
    },
    statusBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    priorityBadge: {
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      border: '1px solid #475569',
      backgroundColor: '#1e293b',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s',
      color: '#f1f5f9'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: '16px', color: '#f1f5f9' }}>🚚 Shipment Queue</h3>
      
      <div style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'incoming', label: 'Incoming' },
          { key: 'outgoing', label: 'Outgoing' }
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.filterTab,
              ...(filter === tab.key ? styles.activeTab : styles.inactiveTab)
            }}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredShipments.map(shipment => (
        <div key={shipment.id} style={styles.shipmentCard}>
          <div style={styles.shipmentHeader}>
            <div style={styles.shipmentId}>{shipment.id}</div>
            <div style={{
              ...styles.typeIndicator,
              ...(shipment.type === 'incoming' ? styles.incomingType : styles.outgoingType)
            }}>
              {shipment.type}
            </div>
          </div>

          <div style={styles.shipmentDetails}>
            <strong>
              {shipment.type === 'incoming' ? 'From: ' : 'To: '}
              {shipment.supplier || shipment.customer}
            </strong>
          </div>

          <div style={styles.itemsList}>
            Items: {shipment.items.map(item => 
              `${item.name} (${item.quantity})`
            ).join(', ')}
          </div>

          <div style={styles.statusBar}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(shipment.status) + '20',
                  color: getStatusColor(shipment.status)
                }}
              >
                {shipment.status}
              </span>
              <span
                style={{
                  ...styles.priorityBadge,
                  backgroundColor: getPriorityColor(shipment.priority) + '20',
                  color: getPriorityColor(shipment.priority)
                }}
              >
                {shipment.priority}
              </span>
            </div>
            
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {getDaysFromNow(shipment.expectedDate)}
            </div>
          </div>

          <div style={styles.actionButtons}>
            {shipment.status === 'pending' && (
              <button
                style={{
                  ...styles.actionButton,
                  backgroundColor: '#dcfce7',
                  borderColor: '#16a34a',
                  color: '#16a34a'
                }}
                onClick={() => updateShipmentStatus(shipment.id, 'confirmed')}
              >
                Confirm
              </button>
            )}
            {shipment.status === 'confirmed' && (
              <button
                style={{
                  ...styles.actionButton,
                  backgroundColor: '#dbeafe',
                  borderColor: '#2563eb',
                  color: '#2563eb'
                }}
                onClick={() => updateShipmentStatus(shipment.id, 'processing')}
              >
                Start Processing
              </button>
            )}
            {shipment.status === 'processing' && (
              <button
                style={{
                  ...styles.actionButton,
                  backgroundColor: '#dcfce7',
                  borderColor: '#16a34a',
                  color: '#16a34a'
                }}
                onClick={() => updateShipmentStatus(shipment.id, 'completed')}
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      ))}

      {filteredShipments.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
          No {filter !== 'all' ? filter : ''} shipments in queue
        </div>
      )}
    </div>
  );
}

export default ShipmentQueue;
