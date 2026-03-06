import React, { useEffect, useRef, useState, useCallback } from "react";
import { styled } from "@mui/material/styles";
import { InputBase, Button, Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { Filtro5 } from "../service/data";
import Cookies from "js-cookie";
import GoogleLogin from "./GoogleLogin";
import logo from "/src/assets/logounivalle.svg";

const HeaderContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  width: "100%",
  height: "80px",
  position: "sticky",
  top: 0,
  marginBottom: "60px",
  zIndex: 2,
  backgroundColor: "#F2F2F2",
  boxShadow: "0px 14px 20px -17px rgba(66, 68, 90, 1)",
  padding: "0 15px",
  [theme.breakpoints.down("md")]: {
    flexWrap: "wrap",
    height: "auto",
    padding: "10px",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
}));

const TitleContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: "1",
  minWidth: "200px",
  [theme.breakpoints.down("md")]: {
    minWidth: "150px",
  },
  [theme.breakpoints.down("sm")]: {
    alignItems: "center",
    width: "100%",
    minWidth: "auto",
  },
}));

const Title = styled("div")(({ theme }) => ({
  fontWeight: 600,
  fontSize: "22px",
  color: "#423b3b",
  fontFamily: "Helvetica, sans-serif",
  lineHeight: "1.2",
  [theme.breakpoints.down("md")]: {
    fontSize: "18px",
  },
  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
    fontSize: "16px",
    margin: "5px 0",
  },
}));

const SearchBar = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  position: "relative",
  flex: "0 0 auto",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "center",
  },
}));

const SearchInputContainer = styled("div")(({ theme }) => ({
  position: "relative",
  width: "200px",
  [theme.breakpoints.down("md")]: {
    width: "180px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    maxWidth: "250px",
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  width: "100%",
  height: "36px",
  paddingRight: "35px",
  paddingLeft: "12px",
  border: "1px solid #ccc",
  borderRadius: "20px",
  fontSize: "14px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
  "&:focus": {
    borderColor: "#007BFF",
    boxShadow: "0px 2px 6px rgba(0, 123, 255, 0.2)",
  },
}));

const StyledSearchIcon = styled(SearchIcon)(({ theme }) => ({
  position: "absolute",
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  color: "#808181",
  fontSize: "20px",
}));

const Username = styled("div")(({ theme }) => ({
  fontSize: "13px",
  fontWeight: 500,
  color: "#666",
  fontFamily: "Helvetica, sans-serif",
  marginTop: "4px",
  [theme.breakpoints.down("md")]: {
    fontSize: "12px",
  },
  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
    fontSize: "11px",
  },
}));

const SearchResultLabel = styled("label")(({ theme }) => ({
  padding: "0.2rem",
  border: "1px solid #ccc",
  marginTop: "-6px",
  marginRight: "20px",
  borderRadius: "5px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
  width: "300px",
  alignSelf: "flex-end",
  position: "absolute",
  right: 0,
  top: "calc(100% + 10px)",
  zIndex: 3,
  maxHeight: "200px",
  overflowY: "auto",
  display: "none",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#888",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
}));

const SearchResultItem = styled("div")(({ theme }) => ({
  padding: "0.5rem",
  "&:hover": {
    backgroundColor: "#d3d3d3",
  },
}));

const Logo = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flex: "0 0 auto",
  "& img": {
    height: "50px",
    [theme.breakpoints.down("md")]: {
      height: "40px",
    },
  },
}));

const AuthContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flex: "0 0 auto",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "center",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "14px",
  padding: "6px 16px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  whiteSpace: "nowrap",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("md")]: {
    fontSize: "13px",
    padding: "5px 14px",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "12px",
    padding: "6px 12px",
  },
}));

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState(['']);
  const [escuela, setEscuela] = useState(['']);
  const [programa, setPrograma] = useState(['']);
  const [isLogged, setIsLogged] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();
  const labelRef = useRef(null);

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const handleSearch = async () => {
    try {
      if (!searchTerm || typeof searchTerm !== "string") {
        setSearchResults([]);
        setIsLabelVisible(false);
        return;
      }

      const academicPrograms = await Filtro5();
      if (!academicPrograms || !Array.isArray(academicPrograms)) {
        console.error("academicPrograms no es una matriz válida");
        return;
      }

      const searchTermNormalized = searchTerm.toLowerCase().trim();
      const results = academicPrograms.filter(
        (programa) =>
          programa["programa académico"] &&
          removeAccents(programa["programa académico"].toLowerCase()).includes(
            searchTermNormalized
          )
      );

      setSearchResults(results);
      setIsLabelVisible(true);
    } catch (error) {
      console.error(
        "Error obteniendo los datos de los programas académicos:",
        error
      );
    }
  };

  const handleResultClick = (result) => {
    navigate("/program_details", { state: result });
    setSearchTerm("");
    setSearchResults([]);
    setIsLabelVisible(false);
  };

  const handleClickOutsideLabel = (event) => {
    if (labelRef.current && !labelRef.current.contains(event.target)) {
      setIsLabelVisible(false);
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const extractNameFromEmail = (email) => {
    const name = email.split('@')[0];
    const [firstName] = name.split('.');
    return capitalizeFirstLetter(firstName);
  };

  // Función para manejar el logout
  const handleLogout = useCallback(() => {
    Cookies.remove('token');
    sessionStorage.removeItem('logged');
    setIsLogged(false);
    setUser('');
    setCargo(['']);
    setEscuela('');
    setPrograma('');
    navigate('/');
  }, [navigate]);

  // Función para manejar el login exitoso
  const handleLoginSuccess = useCallback(() => {
    setShowLoginDialog(false);
    setIsLogged(true);
    // Recargar para actualizar los permisos
    window.location.reload();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideLabel);

    // Verificar si hay token de autenticación
    const token = Cookies.get('token');
    setIsLogged(!!token);

     const fetchPrograma = async (idPrograma) => {
    try {
      const programas = await Filtro5();
      const found = programas.find(p => p.id_programa === idPrograma);
      if (found && found["programa académico"]) {
        setPrograma(found["programa académico"]);
      } else {
        setPrograma('');
      }
    } catch {
      setPrograma('');
    }
  };


    if (sessionStorage.getItem('logged')) {
      const res = JSON.parse(sessionStorage.getItem('logged'));
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
      const email = res[0].user;
      const userName = extractNameFromEmail(email);
      setUser(userName);
      //console.log("Permisos del usuario:", permisos);
      const director = res.find(item => item.permiso.includes("Director Escuela"));
      if (director && director.escuela) {
      setEscuela(director.escuela);
      } else {
      setEscuela('');
      }


        // Director Programa
    const directorPrograma = res.find(item => item.permiso.includes("Director Programa"));
    if (directorPrograma && directorPrograma.id_programa) {
      fetchPrograma(directorPrograma.id_programa);
    } else {
      setPrograma('');
    }

    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLabel);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setSearchResults([]);
      setIsLabelVisible(false);
    } else {
      handleSearch();
    }
  };

  return (
    <HeaderContainer role="navigation" aria-label="Navegación Principal">
      <Logo>
        <Link to="/" alt="Logo Universidad del Valle" aria-label="Homepage de Sistema Siac">
          <img src={logo} loading="lazy" />
        </Link>
      </Logo>
      <TitleContainer>
        <Title>Sistema SIAC Facultad de Salud</Title>
        <Username>
          {user
    ? `${user} - ${isCargo.join(', ')}${
        isCargo.includes("Director Escuela") && escuela
          ? ` - ${escuela}`
          : ""
      }${
        isCargo.includes("Director Programa") && programa
          ? ` - ${programa}`
          : ""
      }`
    : "Cargando..."}
        </Username>
      </TitleContainer>
      <SearchBar>
        <SearchInputContainer>
          <SearchInput
            placeholder="Buscar..."
            value={searchTerm}
            onClick={() => setIsLabelVisible(true)}
            onChange={handleInputChange}
          />
          <StyledSearchIcon />
        </SearchInputContainer>
        <SearchResultLabel
          ref={labelRef}
          style={{ display: isLabelVisible ? "block" : "none" }}
        >
          {searchResults.map((result, index) => (
            <SearchResultItem
              key={index}
              onClick={() => handleResultClick(result)}
            >
              {result["programa académico"]}
              {result["sede"] && result["sede"] !== "Cali" ? ` - ${result["sede"]}` : ""}
            </SearchResultItem>
          ))}
        </SearchResultLabel>
      </SearchBar>
      
      {/* Área de autenticación */}
      <AuthContainer>
        {isLogged ? (
          <StyledButton
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            Salir
          </StyledButton>
        ) : (
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            onClick={() => setShowLoginDialog(true)}
            aria-label="Iniciar sesión"
          >
            Iniciar Sesión
          </StyledButton>
        )}
      </AuthContainer>

      {/* Diálogo de login con Google */}
      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        maxWidth="xs"
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '20px',
            minWidth: '320px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 0 16px 0',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#333' }}>
            Iniciar Sesión
          </span>
          <IconButton
            onClick={() => setShowLoginDialog(false)}
            size="small"
            aria-label="Cerrar diálogo"
            sx={{ 
              color: '#666',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 0',
            gap: '16px',
          }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '0.875rem',
            marginBottom: '8px'
          }}>
            Selecciona tu cuenta de Google institucional
          </Box>
          <GoogleLogin setIsLogin={handleLoginSuccess} />
        </DialogContent>
      </Dialog>
    </HeaderContainer>
  );
};

export default Header;
