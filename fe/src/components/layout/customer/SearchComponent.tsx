import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  ClickAwayListener,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

interface SearchComponentProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchComponent({ 
  placeholder = "Cari produk...",
  onSearch 
}: SearchComponentProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Mock suggestions - bisa diganti dengan API call
  const suggestions = [
    { text: 'Baju Rajutan', category: 'Pakaian', trending: true },
    { text: 'Topi Crochet', category: 'Aksesoris', trending: false },
    { text: 'Tas Rajutan', category: 'Aksesoris', trending: true },
    { text: 'Scarf Wol', category: 'Pakaian', trending: false },
    { text: 'Sarung Tangan', category: 'Aksesoris', trending: false },
    { text: 'Selimut Rajutan', category: 'Rumah Tangga', trending: true },
    { text: 'Bantal Sofa', category: 'Rumah Tangga', trending: false },
  ];

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      onSearch?.(searchQuery.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setQuery(suggestionText);
    handleSearch(suggestionText);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 500 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.25rem',
                  }} 
                />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
                borderWidth: 2,
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontWeight: 500,
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  opacity: 1,
                  fontWeight: 400,
                },
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        />

        {/* Search Suggestions */}
        {showSuggestions && query && filteredSuggestions.length > 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              maxHeight: 320,
              overflow: 'auto',
              borderRadius: 3,
              border: `1px solid ${theme.palette.primary.light}`,
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <List dense sx={{ py: 1 }}>
              {filteredSuggestions.map((suggestion, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '20',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          color="text.primary"
                        >
                          {suggestion.text}
                        </Typography>
                        {suggestion.trending && (
                          <Chip
                            icon={<TrendingIcon sx={{ fontSize: '0.75rem' }} />}
                            label="Trending"
                            size="small"
                            color="secondary"
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {suggestion.category}
                      </Typography>
                    }
                  />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* No Results */}
        {showSuggestions && query && filteredSuggestions.length === 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              borderRadius: 3,
              border: `1px solid ${theme.palette.primary.light}`,
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Tidak ada hasil untuk "{query}"
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Coba kata kunci yang berbeda
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
