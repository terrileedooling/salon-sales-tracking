import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  ShoppingCart,
  Calendar,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import SalesChart from '../components/Sales/SalesChart';
import RecentSales from '../components/Sales/RecentSales';
import '../styles/Dashboard.css';
import DashboardChart from '../components/Sales/DashboardChart';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalSuppliers: 0,
    totalRevenue: 0,
    dailySales: 0,
    monthlyGrowth: 12.5,
    avgOrderValue: 0,
    conversionRate: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [performanceScore, setPerformanceScore] = useState(85);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      // Fetch statistics
      const sales = await firestoreService.getCollection('sales', user.uid);
      const products = await firestoreService.getCollection('products', user.uid);
      const suppliers = await firestoreService.getCollection('suppliers', user.uid);

      // Calculate stats
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const today = new Date().toISOString().split('T')[0];
      const dailySales = sales
        .filter(sale => sale.date === today)
        .reduce((sum, sale) => sum + (sale.total || 0), 0);
      const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
      const conversionRate = Math.min(75, Math.max(0, (sales.length / 100) * 100)); // Mock calculation

      // Find low stock products
      const lowStock = products.filter(product => product.stock <= (product.minStock || 10));

      setStats({
        totalSales: sales.length,
        totalProducts: products.length,
        totalSuppliers: suppliers.length,
        totalRevenue,
        dailySales,
        monthlyGrowth: 12.5,
        avgOrderValue,
        conversionRate
      });

      setRecentSales(sales.slice(0, 5));
      setLowStockProducts(lowStock.slice(0, 5));

      // Calculate performance score based on various metrics
      const score = Math.min(100, Math.floor(
        (totalRevenue > 10000 ? 25 : (totalRevenue / 10000) * 25) +
        (dailySales > 500 ? 25 : (dailySales / 500) * 25) +
        (lowStock.length < 5 ? 25 : 25 - (lowStock.length * 5)) +
        (sales.length > 50 ? 25 : (sales.length / 50) * 25)
      ));
      setPerformanceScore(score);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.displayName}! Here's what's happening with your business today.
          </p>
        </div>
        <div className="date-selector">
          <Calendar size={20} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={`R${stats.totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} />}
          trend={12.5}
          color="primary"
          description="Monthly revenue"
        />
        <StatCard
          title="Today's Sales"
          value={`R${stats.dailySales.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<ShoppingCart size={24} />}
          trend={8.2}
          color="success"
          description="Daily performance"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={<Package size={24} />}
          trend={5.1}
          color="warning"
          description="Active inventory"
        />
        <StatCard
          title="Active Suppliers"
          value={stats.totalSuppliers.toString()}
          icon={<Users size={24} />}
          trend={3.7}
          color="info"
          description="Vendor partners"
        />
        <StatCard
          title="Avg Order Value"
          value={`R${stats.avgOrderValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Target size={24} />}
          trend={4.2}
          color="primary"
          description="Customer spending"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={<Activity size={24} />}
          trend={2.8}
          color="success"
          description="Sales efficiency"
        />
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-main">
        <div className="dashboard-left">
          {/* Sales Overview Chart */}
          <div className="chart-section">
            <div className="section-header">
              <h2>Sales Overview</h2>
              <select className="period-selector">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="chart-container">
              <SalesChart sales={recentSales} />
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="revenue-section">
            <div className="section-header">
              <h2 className="revenue">Revenue Analytics</h2>
            </div>
            <div className="chart-container">
              <DashboardChart sales={recentSales} />
            </div>
          </div>
        </div>

        {/* <div className="dashboard-right"> */}
          {/* Recent Sales */}
          {/* <div className="recent-section">
            <div className="section-header">
              <h2 className="recent">Recent Sales</h2>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/sales'}
              >
                View All
              </button>
            </div>
            <RecentSales sales={recentSales} />
          </div> */}

          {/* Performance Indicator */}
          {/* <div className="performance-indicator">
            <Target size={32} color="var(--primary)" />
            <div className="performance-text">Business Performance</div>
            <div className="performance-value">{performanceScore}%</div>
          </div> */}
        {/* {/* </div> */}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="alert-section">
          <div className="alert-header">
            <h3>Low Stock Alert</h3>
            <span className="badge">{lowStockProducts.length} Items</span>
          </div>
          <div className="alert-products">
            {lowStockProducts.map(product => (
              <div key={product.id} className="product-alert">
                <div className="product-info">
                  <strong>{product.name}</strong>
                  <span>Stock: {product.stock} units | Min: {product.minStock || 10}</span>
                </div>
                <button className="btn btn-sm btn-primary">
                  Reorder Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="action-buttons">
        <button className="quick-action" onClick={() => window.location.href = '/sales'}>
          <Zap size={20} />
          Create New Sale
        </button>
        <button className="quick-action" onClick={() => window.location.href = '/products'}>
          <Package size={20} />
          Add New Product
        </button>
        <button className="quick-action" onClick={() => window.location.href = '/suppliers'}>
          <BarChart3 size={20} />
          Add New Supplier
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color, description }) => (
  <div className={`stat-card stat-card-${color} growth-spark`}>
    <div className="stat-icon">
      {icon}
    </div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      <div className="stat-trend">
        {trend > 0 ? (
          <span className="trend-up">
            {Math.abs(trend)}%
          </span>
        ) : (
          <span className="trend-down">
            {Math.abs(trend)}%
          </span>
        )}
        <span className="trend-label">{description}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;