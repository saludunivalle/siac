import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Filtro5 } from '../service/data';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.grey[400]}`,
  borderRight: `1px solid ${theme.palette.grey[400]}`,
  textAlign: 'center',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  width: '25%', 
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
  const [expiredRRCCount, setExpiredRRCCount] = useState(0);
  const [expiredRACCount, setExpiredRACCount] = useState(0);
  const [isCargo, setCargo] = useState([' ']);

  // Obtener los permisos del usuario
  useEffect(() => {
    if (sessionStorage.getItem('logged')) {
      const res = JSON.parse(sessionStorage.getItem('logged'));
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
    }
  }, []);

  //Función para obtener los programas vencidos en RRC
  const getExpiredRRCPrograms = (programas) => {
      return programas.filter((program) => program['fase rrc'] === 'Vencido');
  };

  //Función para obtener los programas vencidos en RAC
  const getExpiredRACPrograms = (programas) => {
      return programas.filter((program) => program['fase rac'] === 'Vencido');
  };

  // Efecto para obtener los datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
        try {
            let response;
            response = await Filtro5();

            if (!response) {
                throw new Error("response is undefined");
            }
          
            const expiredRRCPrograms = getExpiredRRCPrograms(response);
            const expiredRACPrograms = getExpiredRACPrograms(response);

            setExpiredRRCCount(expiredRRCPrograms);
            setExpiredRACCount(expiredRACPrograms);

        } catch (error) {
            console.error('Error al filtrar datos:', error);
        }
    };

    const buttonGoogle = document.getElementById("buttonDiv");
    if (buttonGoogle) {
        buttonGoogle.classList.add('_display_none');
    }
    fetchData();
  }, []);


  //Función para redirigir a la página de detalles del programa
  const handleRowClick = (program) => {
    navigate('/program_details', { state: program });
  };

  const renderPrograms = (programs) => (
    programs?.length > 0 ? (
      programs.map((program, index) => (
        <StyledTableRow key={index} onClick={() => handleRowClick(program)}>
          <StyledTableCell>{program['programa académico']}</StyledTableCell>
        </StyledTableRow>
      ))
    ) : (
      <StyledTableRow>
        <StyledTableCell colSpan={4}>No hay programas disponibles</StyledTableCell>
      </StyledTableRow>
    )
  );

  return (
    <div>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box className="content content-with-sidebar" sx={{ 
        p: 3,
        ml: { xs: 0, sm: 0, md: '20px', lg: '40px' },
        width: 'calc(100% - 10px)',
        maxWidth: '100%',
        position: 'relative',
        zIndex: 1,
        mt: '80px'
      }}>
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
                  <StyledTableHeadCell>Vencidos</StyledTableHeadCell> 
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.RRC?.oneYear)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.RRC?.twoYears)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.RRC?.threeYears)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiredRRCCount)}</StyledTableCell> 
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
                  <StyledTableHeadCell>Vencidos</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.AAC?.oneYear)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.AAC?.twoYears)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiryPrograms?.AAC?.threeYears)}</StyledTableCell>
                  <StyledTableCell>{renderPrograms(expiredRACCount)}</StyledTableCell> 
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
