import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { InputBase, IconButton} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { Filtro5 } from '../service/data';
import logo from '/src/assets/logovalle.png';

const HeaderContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  placeItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  position: 'sticky', 
  top: 0, 
  marginBottom: '60px',
  zIndex: 2,
  backgroundColor: '#F2F2F2',
  boxShadow: '1px 2px 6px #BFB9A6',
  '@media (max-width:600px)': {
    flexDirection: 'column', 
  },
});

const Title = styled('div')(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 500,
  fontSize: '35px',
  color: '#423b3b',
  [theme.breakpoints.down('sm')]: {
    paddingTop: 0,
    fontSize: '23px',
  },
}));

const SearchBar = styled('div')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end', 
  paddingRight: '10px',
});

const SearchInput = styled(InputBase)({
  marginRight: '0.5rem',
  border: '1px solid #ccc', 
  borderRadius: '5px', 
  paddingLeft: '12px',
  width:"290px",
});

const SearchResultLabel = styled('label')({
  padding: '0.5rem',
  border: '1px solid #ccc',
  marginTop: '-10px',
  marginRight: '20px',
  borderRadius: '5px',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  width:'300px',
  alignSelf:'flex-end',
  position: 'absolute', 
  top: 'calc(100% + 10px)',
  //top: '100%', 
  //right: 0,
  zIndex: 3,
  maxHeight: '200px', 
  overflowY: 'auto',
  display: 'none', 
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  },
});

const SearchResultItem = styled('div')({
  padding: '0.5rem',
  '&:hover': {
    backgroundColor: '#d3d3d3',
  },
});

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const navigate = useNavigate();
  const labelRef = useRef(null);

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const handleSearch = async () => {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        setSearchResults([]);
        setIsLabelVisible(false);
        return;
      }
  
      const academicPrograms = await Filtro5();
      if (!academicPrograms || !Array.isArray(academicPrograms)) {
        console.error('academicPrograms no es una matriz válida');
        return;
      }
  
      const searchTermNormalized = searchTerm.toLowerCase().trim();
      const results = academicPrograms.filter(programa =>
        programa['programa académico'] && removeAccents(programa['programa académico'].toLowerCase()).includes(searchTermNormalized)
      );
  
      setSearchResults(results); 
      setIsLabelVisible(true);
    } catch (error) {
      console.error('Error obteniendo los datos de los programas académicos:', error);
    }
  };
  

  const handleResultClick = (result) => {
    navigate('/program_details', { state: result });
    setSearchTerm('');
    setSearchResults([]);
    setIsLabelVisible(false);
  };

  const handleClickOutsideLabel = (event) => {
    if (labelRef.current && !labelRef.current.contains(event.target)) {
      setIsLabelVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideLabel);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideLabel);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setSearchResults([]);
      setIsLabelVisible(false);
    } else {
      handleSearch();
    }
  };

  return (
    <HeaderContainer>
      <Link to="/">
        <div className='logo' style={{paddingLeft:'10px'}}><img src={logo} alt="Logo" /></div>
      </Link>
      <Title>Sistema SIAC Facultad de Salud</Title>
      <SearchBar>
        <SearchInput 
          placeholder="Buscar..." 
          value={searchTerm} 
          onClick={() => setIsLabelVisible(true)}
          onChange={handleInputChange}
        />
        <IconButton type="submit" aria-label="search" onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
        <SearchResultLabel ref={labelRef} style={{ display: isLabelVisible ? 'block' : 'none' }}>
          {searchResults.map((result, index) => (
            <SearchResultItem key={index} onClick={() => handleResultClick(result)}>
              {result['programa académico']}
            </SearchResultItem>
          ))}
        </SearchResultLabel>
      </SearchBar>
    </HeaderContainer>
  );
}

export default Header;
