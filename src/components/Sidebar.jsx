import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider,
  Tooltip,
  useMediaQuery,
  CircularProgress,
  Box,
  Typography,
  Fade,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Filtro5, Filtro7, Filtro10, clearSheetExceptFirstRow, sendDataToSheetNew } from '../service/data';

const Sidebar = ({ isCargo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);

  // En dispositivos móviles, comenzar con el sidebar cerrado
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  // Obtener el nombre de usuario para el reporte
  useEffect(() => {
    if (sessionStorage.getItem('logged')) {
      const res = JSON.parse(sessionStorage.getItem('logged'));
      if (res.length > 0) {
        setUser(res[0].usuario || '');
      }
    }
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Funciones para el reporte de actividades
  const prepareReportData = async () => {
    try {
      const seguimientos = await Filtro7();
      const programas = await Filtro5();
      const fases = await Filtro10();

      const filteredSeguimientos = seguimientos.filter(seg => seg.usuario === user);

      const reportData = filteredSeguimientos.map(seg => {
        const programa = programas.find(prog => prog.id_programa === seg.id_programa);
        const fase = fases.find(f => f.id === seg.fase);

        return {
          timeStamp: seg.timestamp || '', 
          programaAcademico: programa ? programa['programa académico'] : '', 
          topic: seg.topic || '', 
          mensaje: seg.mensaje || '', 
          riesgo: seg.riesgo || '', 
          urlAdjunto: seg.url_adjunto || '', 
          fase: fase ? fase.fase : '' 
        };
      });

      return reportData;
    } catch (error) {
      console.error('Error al preparar datos del reporte:', error);
      throw error;
    }
  };

  const downloadSheet = (spreadsheetId) => {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    window.open(url, '_blank');
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const spreadsheetId = '1R4Ugfx43AoBjxjsEKYl7qZsAY8AfFNUN_gwcqETwgio';
      const sheetName = 'REPORTE';

      await clearSheetExceptFirstRow(spreadsheetId, sheetName);

      const reportData = await prepareReportData();
      const dataToSend = reportData.map(item => [
        item.timeStamp,
        item.programaAcademico,
        item.topic,
        item.mensaje,
        item.riesgo,
        item.urlAdjunto,
        item.fase
      ]);

      await sendDataToSheetNew(dataToSend);
      downloadSheet(spreadsheetId);
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para abrir enlaces externos
  const openExternalLink = (url) => {
    window.open(url, '_blank');
  };

  // Configuración de elementos del menú
  const menuItems = [
    {
      id: 'main',
      title: 'General',
      items: [
        {
          text: 'Dashboard',
          icon: <HomeIcon />,
          path: '/',
          tooltip: 'Inicio'
        },
        {
          text: 'Programas por Vencer',
          icon: <DescriptionIcon />,
          path: '/programas-venc',
          tooltip: 'Programas por Vencer'
        }
      ]
    },
    {
      id: 'processes',
      title: 'Procesos de Calidad',
      items: [
        {
          text: 'Registro Calificado',
          icon: <VerifiedIcon />,
          path: '/registro-calificado',
          tooltip: 'Registro Calificado'
        },
        {
          text: 'Acreditación Alta Calidad',
          icon: <StarIcon />,
          path: '/acreditacion-alta-calidad',
          tooltip: 'Acreditación Alta Calidad'
        }
      ]
    },
    {
      id: 'management',
      title: 'Gestión',
      items: [
        {
          text: 'Seguimiento PM',
          icon: <AssessmentIcon />,
          path: '/seguimiento-inicio',
          tooltip: 'Seguimiento PM'
        },
        {
          text: 'Docencia Servicio',
          icon: <LocalHospitalIcon />,
          path: '/docencia-servicio',
          tooltip: 'Docencia Servicio'
        },
        ...(isCargo.includes('Creación') || isCargo.includes('Sistemas') ? [{
          text: 'Creación',
          icon: <AddCircleOutlineIcon />,
          path: '/creacion-programa',
          tooltip: 'Creación de Programas'
        }] : [])
      ]
    }
  ];

  // Componente para elementos del menú
  const MenuItem = ({ item, section }) => {
    const active = item.path ? isActive(item.path) : false;
    const itemKey = `${section}-${item.text}`;
    
    const handleClick = () => {
      if (item.externalUrl) {
        openExternalLink(item.externalUrl);
      } else if (item.path) {
        navigate(item.path);
      }
    };
    
    return (
      <Tooltip 
        title={open ? "" : item.tooltip} 
        placement="right"
        arrow
        enterDelay={300}
      >
        <ListItem 
          button 
          onClick={handleClick}
          onMouseEnter={() => setHoveredItem(itemKey)}
          onMouseLeave={() => setHoveredItem(null)}
          sx={{
            py: 1,
            px: open ? 2 : 1.5,
            mx: open ? 0.75 : 0.5,
            my: 0.25,
            borderRadius: open ? '10px' : '8px',
            minHeight: '40px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: active 
              ? 'rgba(178, 34, 34, 0.08)' 
              : hoveredItem === itemKey 
                ? 'rgba(178, 34, 34, 0.04)' 
                : 'transparent',
            transform: hoveredItem === itemKey ? 'translateX(4px)' : 'translateX(0px)',
            boxShadow: active 
              ? '0 2px 8px rgba(178, 34, 34, 0.15)' 
              : hoveredItem === itemKey 
                ? '0 2px 4px rgba(0, 0, 0, 0.08)' 
                : 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: active ? '4px' : '0px',
              backgroundColor: '#B22222',
              borderRadius: '0 4px 4px 0',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <ListItemIcon sx={{
            minWidth: open ? '36px' : '24px',
            color: active ? '#B22222' : '#6C757D',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: active ? 'scale(1.1)' : 'scale(1)',
            '& .MuiSvgIcon-root': {
              fontSize: open ? '18px' : '18px'
            }
          }}>
            {item.icon}
          </ListItemIcon>
          <Collapse in={open} orientation="horizontal">
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#B22222' : '#495057',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em'
                }
              }}
            />
          </Collapse>
        </ListItem>
      </Tooltip>
    );
  };

  // Componente para secciones del menú
  const MenuSection = ({ section }) => (
    <Box key={section.id} sx={{ mb: 0.5 }}>
      <Collapse in={open} orientation="horizontal">
        <Typography sx={{
          px: 2,
          py: 0.5,
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#6C757D',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          {section.title}
        </Typography>
      </Collapse>
      <List sx={{ p: 0 }}>
        {section.items.map((item, index) => (
          <MenuItem key={index} item={item} section={section.id} />
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isLoading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <CircularProgress 
            sx={{ 
              color: '#B22222',
              mb: 2 
            }} 
            size={48}
          />
          <Typography sx={{ 
            color: '#6C757D',
            fontWeight: 500,
            fontSize: '0.875rem',
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            Generando reporte...
          </Typography>
        </Box>
      )}

      <Drawer
        variant="permanent"
        sx={{
          width: open ? 280 : 72,
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiDrawer-paper': {
            width: open ? 280 : 72,
            marginTop: '80px',
            height: 'calc(100vh - 80px)',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: open 
              ? '4px 0 24px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.02)' 
              : '2px 0 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            borderRadius: isMobile ? '0' : '0 16px 16px 0',
            ...(isMobile && {
              position: 'fixed',
              transform: open ? 'translateX(0)' : 'translateX(-100%)',
              zIndex: 1200
            })
          }
        }}
      >
        {/* Header del Sidebar */}
        <Box sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: '56px',
          background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <Fade in={open} timeout={300}>
            <Box sx={{ 
              display: open ? 'flex' : 'none',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #B22222 0%, #DC143C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(178, 34, 34, 0.3)'
              }}>
                <DashboardIcon sx={{ color: 'white', fontSize: '18px' }} />
              </Box>
              <Typography sx={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#B22222',
                fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                letterSpacing: '-0.02em'
              }}>
                SIAC
              </Typography>
            </Box>
          </Fade>
          
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: open ? 'rgba(108, 117, 125, 0.08)' : 'rgba(178, 34, 34, 0.08)',
              color: open ? '#6C757D' : '#B22222',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: open ? 'rgba(108, 117, 125, 0.12)' : 'rgba(178, 34, 34, 0.12)',
                transform: 'scale(1.05)'
              }
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Contenido del menú */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden',
          py: 1
        }}>
          <Box sx={{ 
            overflowY: 'auto',
            height: '100%',
            '&::-webkit-scrollbar': {
              width: '4px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '2px'
            }
          }}>
            {menuItems.map((section) => (
              <MenuSection key={section.id} section={section} />
            ))}

            {/* Sección de reportes */}
            <Box sx={{ 
              mt: 'auto',
              pt: 1,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              mx: 1
            }}>
              <Collapse in={open} orientation="horizontal">
                <Typography sx={{
                  px: 2,
                  py: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#6C757D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Reportes
                </Typography>
              </Collapse>
              
              <Tooltip 
                title={open ? "" : "Asignaciones Académicas"} 
                placement="right"
                arrow
                enterDelay={300}
              >
                <ListItem 
                  button 
                  onClick={() => openExternalLink('https://lookerstudio.google.com/reporting/9e58572e-acd8-411a-8635-3767e4729091/page/p_7d13ppzeqd')}
                  onMouseEnter={() => setHoveredItem('assignments')}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    py: 1,
                    px: open ? 2 : 1.5,
                    mx: open ? 0.75 : 0.5,
                    my: 0.25,
                    borderRadius: open ? '10px' : '8px',
                    minHeight: '40px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: hoveredItem === 'assignments' 
                      ? 'rgba(178, 34, 34, 0.04)' 
                      : 'transparent',
                    transform: hoveredItem === 'assignments' ? 'translateX(4px)' : 'translateX(0px)',
                    boxShadow: hoveredItem === 'assignments' 
                      ? '0 2px 4px rgba(0, 0, 0, 0.08)' 
                      : 'none',
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: open ? '36px' : '24px',
                    color: '#6C757D',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiSvgIcon-root': {
                      fontSize: '18px'
                    }
                  }}>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <Collapse in={open} orientation="horizontal">
                    <ListItemText 
                      primary="Asignaciones Académicas"
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: '#495057',
                          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                          letterSpacing: '-0.01em'
                        }
                      }}
                    />
                  </Collapse>
                </ListItem>
              </Tooltip>
              
              <Tooltip 
                title={open ? "" : "Generar reporte de actividades"} 
                placement="right"
                arrow
                enterDelay={300}
              >
                <ListItem 
                  button 
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                  onMouseEnter={() => setHoveredItem('report')}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    py: 1,
                    px: open ? 2 : 1.5,
                    mx: open ? 0.75 : 0.5,
                    my: 0.25,
                    borderRadius: open ? '10px' : '8px',
                    minHeight: '40px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: hoveredItem === 'report' 
                      ? 'rgba(178, 34, 34, 0.04)' 
                      : 'transparent',
                    transform: hoveredItem === 'report' ? 'translateX(4px)' : 'translateX(0px)',
                    boxShadow: hoveredItem === 'report' 
                      ? '0 2px 4px rgba(0, 0, 0, 0.08)' 
                      : 'none',
                    '&.Mui-disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: open ? '36px' : '24px',
                    color: isLoading ? '#B22222' : '#6C757D',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiSvgIcon-root': {
                      fontSize: '18px'
                    }
                  }}>
                    {isLoading ? <CircularProgress size={18} sx={{ color: '#B22222' }} /> : <SummarizeIcon />}
                  </ListItemIcon>
                  <Collapse in={open} orientation="horizontal">
                    <ListItemText 
                      primary="Reporte de Actividad"
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: '#495057',
                          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                          letterSpacing: '-0.01em'
                        }
                      }}
                    />
                  </Collapse>
                </ListItem>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;