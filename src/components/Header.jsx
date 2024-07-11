import React, { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link, useNavigate } from "react-router-dom";
import { Filtro5 } from "../service/data";
import logo from "/src/assets/logounivalle.svg";

const HeaderContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: "80px",
  position: "sticky",
  top: 0,
  marginBottom: "60px",
  zIndex: 2,
  backgroundColor: "#F2F2F2",
  boxShadow: "0px 14px 20px -17px rgba(66, 68, 90, 1)",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
    height: "auto",
  },
}));

const TitleContainer = styled("div")(({ theme }) => ({
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  whiteSpace: "nowrap",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    position: "static",
    transform: "none",
  },
}));

const Title = styled("div")(({ theme }) => ({
  fontWeight: 600,
  fontSize: "30px",
  color: "#423b3b",
  fontFamily: "Helvetica, sans-serif",
  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
    margin: "10px 0",
  },
}));

const SearchBar = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  position: "relative",
  paddingRight: "20px",
  [theme.breakpoints.down("sm")]: {
    paddingRight: 0,
    width: "100%",
    justifyContent: "center",
  },
}));

const SearchInputContainer = styled("div")(({ theme }) => ({
  position: "relative",
  width: "300px",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    maxWidth: "300px",
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  width: "100%",
  paddingRight: "20px",
  border: "1px solid #ccc",
  borderRadius: "20px",
  paddingLeft: "12px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  "&:focus": {
    borderColor: "#007BFF",
    boxShadow: "0px 4px 8px rgba(0, 123, 255, 0.2)",
  },
}));

const StyledSearchIcon = styled(SearchIcon)(({ theme }) => ({
  position: "absolute",
  right: "4px",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  color: "#808181",
  borderRadius: "100px",
  fontSize: "27px",
}));

const Username = styled("div")(({ theme }) => ({
  textAlign: "center",
  fontWeight: 500,
  paddingRight: "10px",
  paddingLeft: "10px",
  fontFamily: "Helvetica, sans-serif",
  [theme.breakpoints.down("sm")]: {
    marginTop: "10px",
    flexDirection: "column-reverse",
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
  paddingLeft: "10px",
  display: "flex",
}));

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState(['']);
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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideLabel);

    if (sessionStorage.getItem('logged')) {
      const res = JSON.parse(sessionStorage.getItem('logged'));
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
      const email = res[0].user;
      const userName = extractNameFromEmail(email);
      setUser(userName);
      //console.log("Permisos del usuario:", permisos);
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
          {user ? `${user} - ${isCargo.join(', ')}` : "Cargando..."}
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
            </SearchResultItem>
          ))}
        </SearchResultLabel>
      </SearchBar>
    </HeaderContainer>
  );
};

export default Header;
