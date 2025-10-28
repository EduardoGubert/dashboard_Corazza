export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Empreendimentos',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Quantidade',
      },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          label += context.raw;
          return label;
        },
      },
    },
  },
};

export const leadChartConfig = {
  type: 'bar',
  options: chartOptions,
};

export const scheduleChartConfig = {
  type: 'line',
  options: chartOptions,
};

export const brokerChartConfig = {
  type: 'pie',
  options: chartOptions,
};