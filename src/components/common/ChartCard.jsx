import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

const ChartCard = ({ 
  title, 
  data, 
  options, 
  type = 'bar',
  height = 400 
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <Card className="card-shadow" sx={{ width: '100%' }}>
      <CardContent sx={{ padding: '16px !important', width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Box className="chart-container" sx={{ height }}>
          {renderChart()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
