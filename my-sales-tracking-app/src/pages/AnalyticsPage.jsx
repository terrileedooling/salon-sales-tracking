import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageSale: 0,
    topProducts: []
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    // You'll implement actual analytics calculations here
    setAnalytics({
      totalRevenue: 12500,
      totalSales: 150,
      averageSale: 83.33,
      topProducts: [
        { name: 'Shampoo', sales: 45 },
        { name: 'Conditioner', sales: 32 },
        { name: 'Hair Oil', sales: 28 }
      ]
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="page-subtitle">Insights into your business performance</p>
        </div>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="analytics-content">
            <h3>Total Revenue</h3>
            <p className="analytics-value">R{analytics.totalRevenue.toLocaleString('en-ZA')}</p>
            <div className="analytics-trend positive">
              <TrendingUp size={16} />
              <span>12.5% from last month</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon sales">
            <ShoppingBag size={24} />
          </div>
          <div className="analytics-content">
            <h3>Total Sales</h3>
            <p className="analytics-value">{analytics.totalSales}</p>
            <div className="analytics-trend positive">
              <TrendingUp size={16} />
              <span>8.2% from last month</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <DollarSign size={24} />
          </div>
          <div className="analytics-content">
            <h3>Average Sale</h3>
            <p className="analytics-value">R{analytics.averageSale.toFixed(2)}</p>
            <div className="analytics-trend negative">
              <TrendingDown size={16} />
              <span>2.1% from last month</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add charts and more analytics here */}
    </div>
  );
};

export default AnalyticsPage;