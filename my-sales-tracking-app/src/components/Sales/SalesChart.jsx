import { useState, useEffect, useRef } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  ShoppingBag,
  Download
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import '../../styles/Sales.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SalesChart = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, ytd, all
  const [chartType, setChartType] = useState('line'); // line, bar
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    avgTransaction: 0,
    bestDay: { date: '', amount: 0 },
    growth: 0,
    topProducts: []
  });

  const chartRef = useRef();

  useEffect(() => {
    if (user) {
      fetchSalesData();
    }
  }, [user, timeRange]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const salesData = await firestoreService.getCollection('sales');
      setSales(salesData);
      calculateMetrics(salesData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (salesData) => {
    const filteredSales = filterSalesByTimeRange(salesData);
    
    // Calculate totals
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalSales = filteredSales.length;
    const avgTransaction = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Find best day
    const dailySales = {};
    filteredSales.forEach(sale => {
      const date = sale.date || sale.createdAt?.toISOString().split('T')[0];
      if (date) {
        dailySales[date] = (dailySales[date] || 0) + (sale.total || 0);
      }
    });
    
    let bestDay = { date: '', amount: 0 };
    Object.entries(dailySales).forEach(([date, amount]) => {
      if (amount > bestDay.amount) {
        bestDay = { date, amount };
      }
    });
    
    // Calculate growth (compare with previous period)
    const previousPeriodSales = getPreviousPeriodSales(salesData);
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const growth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    // Find top products
    const productSales = {};
    filteredSales.forEach(sale => {
      sale.items?.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + (item.quantity || 0);
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    setMetrics({
      totalRevenue,
      totalSales,
      avgTransaction,
      bestDay,
      growth,
      topProducts
    });
  };

  const filterSalesByTimeRange = (salesData) => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        return salesData;
    }
    
    return salesData.filter(sale => {
      const saleDate = new Date(sale.time || sale.createdAt);
      return saleDate >= startDate;
    });
  };

  const getPreviousPeriodSales = (salesData) => {
    const now = new Date();
    let periodStart, periodEnd;
    
    switch (timeRange) {
      case '7d':
        periodEnd = subDays(now, 7);
        periodStart = subDays(periodEnd, 7);
        break;
      case '30d':
        periodEnd = subDays(now, 30);
        periodStart = subDays(periodEnd, 30);
        break;
      case 'month':
        periodStart = startOfMonth(subDays(now, 30));
        periodEnd = endOfMonth(periodStart);
        break;
      default:
        return [];
    }
    
    return salesData.filter(sale => {
      const saleDate = new Date(sale.time || sale.createdAt);
      return saleDate >= periodStart && saleDate <= periodEnd;
    });
  };

  const prepareChartData = () => {
    const filteredSales = filterSalesByTimeRange(sales);
    
    // Group sales by date
    const dailyData = {};
    filteredSales.forEach(sale => {
      const date = sale.date || sale.createdAt?.toISOString().split('T')[0];
      if (date) {
        dailyData[date] = (dailyData[date] || 0) + (sale.total || 0);
      }
    });
    
    // Sort dates and prepare labels
    const dates = Object.keys(dailyData).sort();
    const revenueData = dates.map(date => dailyData[date]);
    
    // Prepare chart data
    const data = {
      labels: dates.map(date => format(new Date(date), 'MMM dd')),
      datasets: [
        {
          label: 'Daily Revenue',
          data: revenueData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
    
    return data;
  };

  const preparePaymentMethodData = () => {
    const filteredSales = filterSalesByTimeRange(sales);
    
    const paymentMethods = {};
    filteredSales.forEach(sale => {
      const method = sale.paymentMethod || 'cash';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });
    
    const labels = Object.keys(paymentMethods);
    const data = Object.values(paymentMethods);
    const backgroundColors = [
      'rgba(59, 130, 246, 0.8)',  // Blue for cash
      'rgba(16, 185, 129, 0.8)',  // Green for card
      'rgba(245, 158, 11, 0.8)',  // Orange for eft
      'rgba(239, 68, 68, 0.8)',   // Red for credit
    ];
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderWidth: 1
      }]
    };
  };

  const prepareTopProductsData = () => {
    const topProducts = metrics.topProducts;
    
    return {
      labels: topProducts.map(p => p.name),
      datasets: [{
        label: 'Units Sold',
        data: topProducts.map(p => p.quantity),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Sales Revenue - Last ${timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : 'Month'}`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R' + value.toLocaleString();
          }
        }
      }
    }
  };

  const exportChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `sales-chart-${timeRange}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading sales analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="page-header">
        <h1>Sales Analytics</h1>
        <div className="header-actions">
          <div className="time-range-selector">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="select-input"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="month">This Month</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="chart-type-selector">
            <button 
              className={`type-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button 
              className={`type-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
          </div>
          <button className="btn export-chart" onClick={exportChart}>
            <Download size={16} />
            Export Chart
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#3b82f6' }}>
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>R{metrics.totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h3>
            <p>Total Revenue</p>
            <div className="metric-trend">
              {metrics.growth >= 0 ? (
                <>
                  <TrendingUp size={16} color="#10b981" />
                  <span style={{ color: '#10b981' }}>{metrics.growth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown size={16} color="#ef4444" />
                  <span style={{ color: '#ef4444' }}>{Math.abs(metrics.growth).toFixed(1)}%</span>
                </>
              )}
              <span className="metric-period">vs previous period</span>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#10b981' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="metric-content">
            <h3>{metrics.totalSales}</h3>
            <p>Total Sales</p>
            <div className="metric-subtext">
              {metrics.avgTransaction > 0 && (
                <span>Avg: R{metrics.avgTransaction.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#f59e0b' }}>
            <Calendar size={24} />
          </div>
          <div className="metric-content">
            <h3>
              {metrics.bestDay.date 
                ? format(new Date(metrics.bestDay.date), 'MMM dd')
                : 'N/A'
              }
            </h3>
            <p>Best Day</p>
            <div className="metric-subtext">
              {metrics.bestDay.amount > 0 && (
                <span>R{metrics.bestDay.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>
              {metrics.topProducts[0]?.quantity || 0}
            </h3>
            <p>Top Product Sales</p>
            <div className="metric-subtext">
              {metrics.topProducts[0]?.name || 'No data'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Main Revenue Chart */}
        <div className="chart-card main-chart">
          <div className="chart-header">
            <h3>Revenue Trend</h3>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'rgb(59, 130, 246)' }}></div>
                <span>Daily Revenue</span>
              </div>
            </div>
          </div>
          <div className="chart-container">
            {chartType === 'line' ? (
              <Line 
                ref={chartRef}
                data={prepareChartData()} 
                options={chartOptions}
              />
            ) : (
              <Bar 
                ref={chartRef}
                data={prepareChartData()} 
                options={chartOptions}
              />
            )}
          </div>
        </div>
        
        {/* Payment Methods Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Payment Methods</h3>
          </div>
          <div className="chart-container pie-chart">
            <Pie 
              data={preparePaymentMethodData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Top Products Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Selling Products</h3>
          </div>
          <div className="chart-container">
            <Bar 
              data={prepareTopProductsData()}
              options={{
                responsive: true,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Sales Summary */}
        <div className="summary-card">
          <h3>Sales Summary</h3>
          <div className="summary-list">
            <div className="summary-item">
              <span>Period:</span>
              <span>
                {timeRange === '7d' ? 'Last 7 Days' : 
                 timeRange === '30d' ? 'Last 30 Days' :
                 timeRange === 'month' ? 'This Month' :
                 timeRange === '90d' ? 'Last 90 Days' :
                 timeRange === 'ytd' ? 'Year to Date' : 'All Time'}
              </span>
            </div>
            <div className="summary-item">
              <span>Days with Sales:</span>
              <span>{new Set(sales.map(s => s.date)).size}</span>
            </div>
            <div className="summary-item">
              <span>Average Daily Revenue:</span>
              <span>
                R{(metrics.totalRevenue / 7).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="summary-item">
              <span>Most Popular Payment:</span>
              <span>
                {(() => {
                  const methods = sales.reduce((acc, sale) => {
                    const method = sale.paymentMethod || 'cash';
                    acc[method] = (acc[method] || 0) + 1;
                    return acc;
                  }, {});
                  
                  const mostPopular = Object.entries(methods).sort((a, b) => b[1] - a[1])[0];
                  return mostPopular ? mostPopular[0] : 'N/A';
                })()}
              </span>
            </div>
          </div>
          
          <div className="insights-section">
            <h4>Insights</h4>
            <ul className="insights-list">
              {metrics.growth > 10 && (
                <li>Sales growing at a healthy rate of {metrics.growth.toFixed(1)}%</li>
              )}
              {metrics.bestDay.amount > (metrics.totalRevenue / 7) * 1.5 && (
                <li>Your best day was {metrics.bestDay.date} - consider what made it successful</li>
              )}
              {metrics.topProducts.length > 0 && (
                <li>Your top product is {metrics.topProducts[0].name} with {metrics.topProducts[0].quantity} units sold</li>
              )}
              {sales.filter(s => s.discount > 0).length > (sales.length * 0.5) && (
                <li>Many sales include discounts - review your pricing strategy</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;