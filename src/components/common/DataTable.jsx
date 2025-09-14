import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip
} from '@mui/material';
import { getIndicadorMatricula, getIndicadorAsignacion, getIndicadorDemanda } from '../../utils/dashboardUtils';

const DataTable = ({ 
  title, 
  data, 
  columns, 
  maxRows = 50,
  showPagination = true 
}) => {
  const displayData = data.slice(0, maxRows);

  const renderCellContent = (item, column) => {
    switch (column.type) {
      case 'tca':
        return (
          <Chip 
            label={`${item[column.key]}%`}
            size="small" 
            color={parseFloat(item[column.key]) >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
        );
      case 'indicador':
        const indicador = getIndicadorMatricula(item[column.sourceKey]);
        return (
          <Chip 
            label={`${indicador.icon} ${indicador.label}`}
            size="small" 
            color={indicador.color}
            variant="outlined"
          />
        );
      case 'indicadorAsignacion':
        const indicadorAsignacion = getIndicadorAsignacion(item[column.sourceKey]);
        return (
          <Chip 
            label={`${indicadorAsignacion.icon} ${indicadorAsignacion.label}`}
            size="small" 
            color={indicadorAsignacion.color}
            variant="outlined"
          />
        );
      case 'number':
        return typeof item[column.key] === 'number' 
          ? item[column.key].toLocaleString() 
          : item[column.key];
      case 'indicadorDemanda':
        const indicadorDemanda = getIndicadorDemanda({
          inscritos: item.inscritos,
          cuposMin: item.cuposMin,
          cuposMax: item.cuposMax
        });
        return (
          <Chip 
            label={`${indicadorDemanda.icon} ${indicadorDemanda.label}`}
            size="small" 
            color={indicadorDemanda.color}
            variant="outlined"
          />
        );
      default:
        return item[column.key];
    }
  };

  return (
    <Card className="card-shadow" sx={{ width: '100%' }}>
      <CardContent sx={{ padding: '16px !important', width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title} ({data.length} {data.length === 1 ? 'registro' : 'registros'})
        </Typography>
        <Table className="table-container" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>
                  <strong>{column.header}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((item, index) => (
              <TableRow key={index} hover>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {renderCellContent(item, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showPagination && data.length > maxRows && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            className="table-pagination"
            sx={{ mt: 2 }}
          >
            Mostrando los primeros {maxRows} registros de {data.length} totales
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
