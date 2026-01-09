import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardChart = ({ sales }) => {
  // Prepare data for the last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const prepareChartData = () => {
    const last7Days = getLast7Days();
    
    // Group sales by date
    const dailyRevenue = {};
    sales.forEach(sale => {
      const saleDate = sale.date || sale.createdAt?.toISOString().split('T')[0];
      if (saleDate && last7Days.includes(saleDate)) {
        dailyRevenue[saleDate] = (dailyRevenue[saleDate] || 0) + (sale.total || 0);
      }
    });

    // Fill in missing days with 0
    const revenueData = last7Days.map(date => dailyRevenue[date] || 0);
    const labels = last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Daily Revenue',
          data: revenueData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `R${context.parsed.y.toLocaleString('en-ZA', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return 'R' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <div className="dashboard-chart">
      <Line data={prepareChartData()} options={options} />
    </div>
  );
};

export default DashboardChart;