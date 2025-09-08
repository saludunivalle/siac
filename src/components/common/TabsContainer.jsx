import React from 'react';
import {
  Card,
  Tabs,
  Tab,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TABS_CONFIG } from '../../constants/dashboardConstants';

const TabsContainer = ({ activeTab, onTabChange, tabs = TABS_CONFIG }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Card className="card-shadow" sx={{ mb: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => onTabChange(newValue)}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        className="tab-container"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 64,
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'none',
            color: '#666',
            '&.Mui-selected': {
              color: '#B22222',
              fontWeight: 700
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#B22222',
            height: 3
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab 
            key={tab.id}
            label={tab.label} 
            className="dashboard-tab"
            sx={{ 
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(178, 34, 34, 0.04)'
              }
            }} 
          />
        ))}
      </Tabs>
    </Card>
  );
};

export default TabsContainer;
