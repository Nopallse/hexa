import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { LocationOn, Search } from '@mui/icons-material';
import axiosInstance from '@/services/axiosInstance';

interface Area {
  id: string;
  name: string;
  country_name: string;
  country_code: string;
  administrative_division_level_1_name: string;
  administrative_division_level_1_type: string;
  administrative_division_level_2_name: string;
  administrative_division_level_2_type: string;
  administrative_division_level_3_name: string;
  administrative_division_level_3_type: string;
  postal_code: number;
}

interface AreaAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: Area | null;
  onChange?: (area: Area | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  countries?: string;
  type?: 'single' | 'multiple';
  limit?: number;
}

export default function AreaAutocomplete({
  label = 'Pilih Area',
  placeholder = 'Ketik nama kota, kecamatan, atau kode pos...',
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  required = false,
  countries = 'ID',
  type = 'single',
  limit = 10
}: AreaAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Debounced search function
  const searchAreas = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await axiosInstance.get('/shipping/areas', {
        params: {
          input: searchTerm,
          countries,
          type,
          limit
        }
      });

      if (response.data.success) {
        setOptions(response.data.data.areas || []);
      } else {
        setErrorMessage(response.data.error || 'Gagal memuat data area');
        setOptions([]);
      }
    } catch (error: any) {
      console.error('Area search error:', error);
      setErrorMessage('Terjadi kesalahan saat mencari area');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchAreas(inputValue);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue]);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: Area | null) => {
    onChange?.(newValue);
  };

  const formatAreaName = (area: Area) => {
    return `${area.administrative_division_level_3_name}, ${area.administrative_division_level_2_name}, ${area.administrative_division_level_1_name}. ${area.postal_code}`;
  };

  const getAreaLabel = (area: Area) => {
    return formatAreaName(area);
  };

  return (
    <Box>
      <Autocomplete
        value={value}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={options}
        getOptionLabel={getAreaLabel}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        disabled={disabled}
        noOptionsText={inputValue.length < 2 ? 'Ketik minimal 2 karakter...' : 'Tidak ada area ditemukan'}
        loadingText="Mencari area..."
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={error || !!errorMessage}
            helperText={errorMessage || helperText}
            required={required}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <LocationOn sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                </Box>
              ),
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {loading ? <CircularProgress color="inherit" size={20} /> : <Search sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />}
                  {params.InputProps.endAdornment}
                </Box>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body1" fontWeight={500}>
                {formatAreaName(option)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip 
                  label={option.administrative_division_level_2_name} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
                <Chip 
                  label={option.postal_code} 
                  size="small" 
                  variant="outlined" 
                  color="secondary"
                />
              </Box>
            </Box>
          </Box>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={formatAreaName(option)}
              variant="outlined"
              color="primary"
              icon={<LocationOn />}
            />
          ))
        }
      />
      
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
}
