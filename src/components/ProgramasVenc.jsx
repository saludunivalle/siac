import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.grey[400]}`,
  borderRight: `1px solid ${theme.palette.grey[400]}`,
  textAlign: 'center',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  width: '33%',
  padding: '8px',
  '&:first-of-type': {
    borderLeft: 'none',
  },
  '&:last-of-type': {
    borderRight: 'none',
  },
}));

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.common.black,
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.grey[50],
  },
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ProgramasVenc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { expiryPrograms } = location.state || {};

  const handleRowClick = (program) => {
    navigate('/program_details', { state: program });
  };

  const renderPrograms = (programs) => (
    programs?.map((program, index) => (
      <StyledTableRow key={index} onClick={() => handleRowClick(program)}>
        <StyledTableCell>{program['programa académico']}</StyledTableCell>
      </StyledTableRow>
    ))
  );

  return (
    <div>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Programas por Vencer</Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Años Vencimiento RC</Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>1 año</StyledTableHeadCell>
                  <StyledTableHeadCell>2 años</StyledTableHeadCell>
                  <StyledTableHeadCell>3 años</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.RRC?.oneYear)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.RRC?.twoYears)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.RRC?.threeYears)}</StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" gutterBottom>Años Vencimiento AAC</Typography>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>1 año</StyledTableHeadCell>
                  <StyledTableHeadCell>2 años</StyledTableHeadCell>
                  <StyledTableHeadCell>3 años</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.AAC?.oneYear)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.AAC?.twoYears)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.AAC?.threeYears)}</StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </div>
  );
};

export default ProgramasVenc;
