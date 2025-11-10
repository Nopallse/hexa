import {
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Box,
  TextField,
  Stack,
  Collapse,
  CircularProgress,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  RadioGroup,
  Radio,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { addressApi } from '@/features/addresses/services/addressApi';
import type { Address, CreateAddressData } from '@/features/addresses/services/addressApi';
import AreaAutocomplete from '@/components/common/AreaAutocomplete';

interface ShippingAddressProps {
  selectedAddress: string | null;
  onAddressSelect: (addressId: string) => void;
  onAddressesLoaded?: (addresses: Address[]) => void;
}

export default function ShippingAddress({ 
  selectedAddress, 
  onAddressSelect,
  onAddressesLoaded 
}: ShippingAddressProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAddressData>({
    recipient_name: '',
    phone_number: '',
    address_line: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'ID',
    is_primary: false,
  });
  const [selectedArea, setSelectedArea] = useState<any>(null);
  
  // Supported countries
  const supportedCountries = [
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  ];

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await addressApi.getAddresses();

        if (response.success && response.data) {
          setAddresses(response.data);
          onAddressesLoaded?.(response.data);
          
          // Auto-select primary address or first address
          if (response.data.length > 0 && !selectedAddress) {
            const primary = response.data.find(addr => addr.is_primary) || response.data[0];
            if (primary) {
              onAddressSelect(primary.id);
            }
          }
        } else {
          setError('Gagal memuat alamat');
        }
      } catch (err: any) {
        console.error('Error fetching addresses:', err);
        setError(err.response?.data?.error || 'Gagal memuat alamat');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleFormChange = (field: keyof CreateAddressData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleFormCheckboxChange = (field: keyof CreateAddressData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  const handleAreaSelect = (area: any) => {
    setSelectedArea(area);
    if (area) {
      setFormData(prev => ({
        ...prev,
        city: area.administrative_division_level_2_name,
        province: area.administrative_division_level_1_name,
        postal_code: area.postal_code.toString()
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.recipient_name.trim()) {
      setFormError('Nama penerima wajib diisi');
      return;
    }
    if (!formData.phone_number.trim()) {
      setFormError('Nomor telepon wajib diisi');
      return;
    }
    if (!formData.address_line.trim()) {
      setFormError('Alamat lengkap wajib diisi');
      return;
    }
    if (!formData.city.trim()) {
      setFormError('Kota wajib diisi');
      return;
    }
    if (!formData.province.trim()) {
      setFormError('Provinsi wajib diisi');
      return;
    }
    if (!formData.postal_code.trim()) {
      setFormError('Kode pos wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const response = await addressApi.createAddress(formData);

      if (response.success && response.data) {
        // Refresh addresses
        const addressesResponse = await addressApi.getAddresses();
        if (addressesResponse.success && addressesResponse.data) {
          setAddresses(addressesResponse.data);
          onAddressesLoaded?.(addressesResponse.data);
          
          // Select the newly created address
          onAddressSelect(response.data.id);
        }

        // Reset form
        setFormData({
          recipient_name: '',
          phone_number: '',
          address_line: '',
          city: '',
          province: '',
          postal_code: '',
          country: 'ID',
          is_primary: false,
        });
        setSelectedArea(null);
        setShowAddForm(false);
      } else {
        setFormError(response.error || 'Gagal menambah alamat');
      }
    } catch (err: any) {
      console.error('Error creating address:', err);
      setFormError(err.response?.data?.error || 'Gagal menambah alamat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      recipient_name: '',
      phone_number: '',
      address_line: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'ID',
      is_primary: false,
    });
    setSelectedArea(null);
    setShowAddForm(false);
    setFormError(null);
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Has addresses - show selected address
  const selectedAddressData = addresses.length > 0 
    ? (addresses.find(addr => addr.id === selectedAddress) || 
       addresses.find(addr => addr.is_primary) || 
       addresses[0])
    : null;

  return (
    <>
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            sx={{ 
              mb: { xs: 1.5, sm: 2 }, 
              color: 'text.primary',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Alamat Pengiriman
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* No addresses - show message */}
          {addresses.length === 0 && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                borderRadius: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Anda belum memiliki alamat pengiriman. Silakan tambahkan alamat terlebih dahulu.
            </Alert>
          )}

          {/* Display Selected Address */}
          {selectedAddressData && (
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                backgroundColor: 'action.hover',
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                <LocationIcon 
                  color="primary" 
                  sx={{ 
                    mt: 0.5, 
                    flexShrink: 0,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      {selectedAddressData.recipient_name}
                    </Typography>
                    {selectedAddressData.is_primary && (
                      <Chip
                        label="Utama"
                        size="small"
                        color="primary"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                          height: { xs: 18, sm: 20 } 
                        }}
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 0.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {selectedAddressData.phone_number}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 1,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {selectedAddressData.address_line}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {selectedAddressData.city}, {selectedAddressData.province} {selectedAddressData.postal_code}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 0.5 }}
                  >
                    {selectedAddressData.country === 'ID' ? '🇮🇩 Indonesia' : `🌍 ${selectedAddressData.country}`}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Change Address Button - Show if there are multiple addresses */}
          {addresses.length > 1 && selectedAddressData && !showAddForm && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setShowSelectDialog(true)}
              fullWidth
              sx={{
                mb: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 1.25 },
                borderRadius: 2,
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: 40, sm: 44 },
                textTransform: 'none',
              }}
            >
              Ganti Alamat ({addresses.length} alamat tersedia)
            </Button>
          )}

          {!showAddForm && (
            <Button
              variant={addresses.length === 0 ? "contained" : "outlined"}
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
              fullWidth
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: 2,
                fontWeight: addresses.length === 0 ? 600 : 500,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: 44, sm: 48 },
                ...(addresses.length === 0 && {
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }),
              }}
            >
              {addresses.length === 0 ? 'Tambah Alamat' : 'Tambah Alamat Baru'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Select Address Dialog */}
      <Dialog
        open={showSelectDialog}
        onClose={() => setShowSelectDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Pilih Alamat Pengiriman
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedAddress || ''}
              onChange={(e) => {
                onAddressSelect(e.target.value);
                setShowSelectDialog(false);
              }}
            >
              <Stack spacing={2}>
                {addresses.map((address) => (
                  <Card
                    key={address.id}
                    sx={{
                      border: selectedAddress === address.id ? '2px solid' : '1px solid',
                      borderColor: selectedAddress === address.id ? 'primary.main' : 'grey.300',
                      backgroundColor: selectedAddress === address.id ? 'primary.light' : 'white',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.light',
                      },
                    }}
                    onClick={() => {
                      onAddressSelect(address.id);
                      setShowSelectDialog(false);
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <FormControlLabel
                        value={address.id}
                        control={<Radio />}
                        label=""
                        sx={{ m: 0 }}
                      />
                      <Box sx={{ ml: { xs: 3, sm: 4 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {address.recipient_name}
                          </Typography>
                          {address.is_primary && (
                            <Chip
                              label="Utama"
                              size="small"
                              color="primary"
                              sx={{ 
                                fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                                height: { xs: 18, sm: 20 } 
                              }}
                            />
                          )}
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {address.phone_number}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {address.address_line}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {address.city}, {address.province} {address.postal_code}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 0.5 }}
                        >
                          {address.country === 'ID' ? '🇮🇩 Indonesia' : `🌍 ${address.country}`}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button
            onClick={() => setShowSelectDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Batal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Address Dialog */}
      <Dialog
        open={showAddForm}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              Tambah Alamat Baru
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {formError && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setFormError(null)}
              >
                {formError}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nama Penerima"
                  value={formData.recipient_name}
                  onChange={handleFormChange('recipient_name')}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nomor Telepon"
                  value={formData.phone_number}
                  onChange={handleFormChange('phone_number')}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alamat Lengkap"
                  value={formData.address_line}
                  onChange={handleFormChange('address_line')}
                  variant="outlined"
                  placeholder="Masukkan alamat lengkap (nama jalan, nomor rumah, dll)"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Negara</InputLabel>
                  <Select
                    value={formData.country}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        country: e.target.value,
                        city: '',
                        province: '',
                        postal_code: ''
                      }));
                      setSelectedArea(null);
                    }}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    {supportedCountries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                {formData.country === 'ID' ? (
                  <AreaAutocomplete
                    label="Pilih Area"
                    placeholder="Ketik nama kota, kecamatan, atau kode pos..."
                    value={selectedArea}
                    onChange={handleAreaSelect}
                    required
                    countries="ID"
                    limit={10}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Manual Address Entry"
                    placeholder="Enter address details manually for international addresses"
                    variant="outlined"
                    disabled
                    helperText={`Area autocomplete is only available for Indonesia. Please fill the fields below manually for ${supportedCountries.find(c => c.code === formData.country)?.name}.`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kota"
                  value={formData.city}
                  onChange={handleFormChange('city')}
                  variant="outlined"
                  disabled={formData.country === 'ID' && !!selectedArea}
                  helperText={
                    formData.country === 'ID' && selectedArea 
                      ? "Otomatis terisi dari area yang dipilih" 
                      : formData.country === 'ID'
                      ? "Masukkan nama kota atau pilih dari area autocomplete"
                      : `Masukkan nama kota untuk ${supportedCountries.find(c => c.code === formData.country)?.name}`
                  }
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Provinsi/State"
                  value={formData.province}
                  onChange={handleFormChange('province')}
                  variant="outlined"
                  disabled={formData.country === 'ID' && !!selectedArea}
                  helperText={
                    formData.country === 'ID' && selectedArea 
                      ? "Otomatis terisi dari area yang dipilih" 
                      : formData.country === 'ID'
                      ? "Masukkan nama provinsi atau pilih dari area autocomplete"
                      : `Masukkan nama provinsi/state untuk ${supportedCountries.find(c => c.code === formData.country)?.name}`
                  }
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kode Pos/ZIP Code"
                  value={formData.postal_code}
                  onChange={handleFormChange('postal_code')}
                  variant="outlined"
                  disabled={formData.country === 'ID' && !!selectedArea}
                  helperText={
                    formData.country === 'ID' && selectedArea 
                      ? "Otomatis terisi dari area yang dipilih" 
                      : formData.country === 'ID'
                      ? "Masukkan kode pos atau pilih dari area autocomplete"
                      : `Masukkan kode pos/ZIP code untuk ${supportedCountries.find(c => c.code === formData.country)?.name}`
                  }
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_primary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_primary: e.target.checked
                      }))}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Set sebagai Alamat Utama
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.is_primary 
                          ? 'Alamat ini akan menjadi alamat utama untuk pengiriman'
                          : 'Alamat ini akan menjadi alamat tambahan'
                        }
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mt: 1 }}
                />
              </Grid>
            </Grid>

            {/* Selected Area Info */}
            {selectedArea && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'primary.light', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'primary.dark' }}>
                  Area yang Dipilih:
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.dark' }}>
                  {selectedArea.administrative_division_level_3_name}, {selectedArea.administrative_division_level_2_name}, {selectedArea.administrative_division_level_1_name} - {selectedArea.postal_code}
                </Typography>
              </Box>
            )}

            {/* Form Actions */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Batal
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                {submitting ? <CircularProgress size={20} /> : 'Simpan'}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
    </>
  );
}

