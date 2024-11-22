"use client";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format, subDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ActivityChartProps {
  data: Array<{
    timestamp: string;
    success: boolean;
  }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  // Process data for the last 30 days
  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => subDays(today, i));
  
  const successCounts = new Map<string, number>();
  const failureCounts = new Map<string, number>();
  
  dates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    successCounts.set(dateStr, 0);
    failureCounts.set(dateStr, 0);
  });

  data.forEach(activity => {
    const dateStr = format(new Date(activity.timestamp), 'yyyy-MM-dd');
    if (activity.success) {
      successCounts.set(dateStr, (successCounts.get(dateStr) || 0) + 1);
    } else {
      failureCounts.set(dateStr, (failureCounts.get(dateStr) || 0) + 1);
    }
  });

  const chartData = {
    labels: dates.reverse().map(date => format(date, 'MMM d')),
    datasets: [
      {
        label: 'Successful Logins',
        data: Array.from(successCounts.values()).reverse(),
        borderColor: 'hsl(var(--chart-1))',
        backgroundColor: 'hsl(var(--chart-1) / 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Failed Attempts',
        data: Array.from(failureCounts.values()).reverse(),
        borderColor: 'hsl(var(--chart-2))',
        backgroundColor: 'hsl(var(--chart-2) / 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}