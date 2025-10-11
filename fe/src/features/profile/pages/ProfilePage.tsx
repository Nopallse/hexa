import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as AddressIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { addressApi } from '@/features/addresses/services/addressApi';
import { Address } from '@/features/addresses/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

export default function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { user, updateProfile } = useAuthStore();
  const { t } = useTranslation();
  
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  
  // Address dialog states
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    address_line: '',
    city: '',
    province: '',
    postal_code: '',
    is_primary: false,
  });
  const [addressFormLoading, setAddressFormLoading] = useState(false);
  const [addressFormError, setAddressFormError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
      });
    }
  }, [user]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setAddressesLoading(true);
        setAddressesError(null);
        const response = await addressApi.getAddresses();
        if (response.success) {
          setAddresses(response.data);
        } else {
          setAddressesError(response.error || 'Gagal memuat alamat');
        }
      } catch (err: any) {
        setAddressesError(err.message || 'Gagal memuat alamat');
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateProfile(formData);
      setSuccess('Profil berhasil diperbarui');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Address dialog handlers
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      address_line: '',
      city: '',
      province: '',
      postal_code: '',
      is_primary: false,
    });
    setAddressFormError(null);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressFormData({
      address_line: address.address_line,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      is_primary: address.is_primary,
    });
    setAddressFormError(null);
    setShowAddressDialog(true);
  };

  const handleAddressFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddressFormCheckboxChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleAddressFormSubmit = async () => {
    try {
      setAddressFormLoading(true);
      setAddressFormError(null);

      if (editingAddress) {
        // Update existing address
        const response = await addressApi.updateAddress(editingAddress.id, addressFormData);
        if (response.success) {
          // Refresh addresses
          const addressesResponse = await addressApi.getAddresses();
          if (addressesResponse.success) {
            setAddresses(addressesResponse.data);
          }
          setShowAddressDialog(false);
        } else {
          setAddressFormError(response.error || 'Gagal memperbarui alamat');
        }
      } else {
        // Create new address
        const response = await addressApi.createAddress(addressFormData);
        if (response.success) {
          // Refresh addresses
          const addressesResponse = await addressApi.getAddresses();
          if (addressesResponse.success) {
            setAddresses(addressesResponse.data);
          }
          setShowAddressDialog(false);
        } else {
          setAddressFormError(response.error || 'Gagal menambah alamat');
        }
      }
    } catch (err: any) {
      setAddressFormError(err.message || 'Terjadi kesalahan');
    } finally {
      setAddressFormLoading(false);
    }
  };

  const handleAddressFormCancel = () => {
    setShowAddressDialog(false);
    setEditingAddress(null);
    setAddressFormError(null);
  };

  const handleDeleteAddress = async (address: Address) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      return;
    }

    try {
      const response = await addressApi.deleteAddress(address.id);
      if (response.success) {
        // Refresh addresses
        const addressesResponse = await addressApi.getAddresses();
        if (addressesResponse.success) {
          setAddresses(addressesResponse.data);
        }
      } else {
        setAddressesError(response.error || 'Gagal menghapus alamat');
      }
    } catch (err: any) {
      setAddressesError(err.message || 'Gagal menghapus alamat');
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            mb: 1
          }}
        >
          Akun Saya
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
        >
          Kelola informasi pribadi dan alamat Anda
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.grey[200]}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{
            borderBottom: `1px solid ${theme.palette.grey[200]}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              py: 2,
              px: 3,
              minHeight: 'auto',
              '&.Mui-selected': {
                fontWeight: 600,
                color: 'primary.main',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            icon={<PersonIcon sx={{ fontSize: '1.2rem', mb: 0.5 }} />}
            iconPosition="start"
            label="Profil"
            {...a11yProps(0)}
          />
          <Tab
            icon={<AddressIcon sx={{ fontSize: '1.2rem', mb: 0.5 }} />}
            iconPosition="start"
            label="Alamat"
            {...a11yProps(1)}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Profile Tab Content */}
        <Box>
          {/* Success/Error Messages */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Profile Picture & Basic Info */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: '3rem' }} />
                  </Avatar>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      color: 'text.primary'
                    }}
                  >
                    {user.full_name || 'Nama belum diisi'}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {user.email}
                  </Typography>

                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Edit Profil
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      Informasi Pribadi
                    </Typography>
                    
                    {isEditing && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={loading}
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
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={loading}
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
                          {loading ? <CircularProgress size={20} /> : 'Simpan'}
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* Full Name */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Nama Lengkap
                        </Typography>
                      </Box>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={formData.full_name}
                          onChange={handleInputChange('full_name')}
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.full_name || 'Belum diisi'}
                        </Typography>
                      )}
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                      </Box>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={formData.email}
                          onChange={handleInputChange('email')}
                          variant="outlined"
                          size="small"
                          type="email"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.email}
                        </Typography>
                      )}
                    </Grid>

                    {/* Phone */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Nomor Telepon
                        </Typography>
                      </Box>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={formData.phone}
                          onChange={handleInputChange('phone')}
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.phone || 'Belum diisi'}
                        </Typography>
                      )}
                    </Grid>

                    {/* Gender */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Jenis Kelamin
                        </Typography>
                      </Box>
                      {isEditing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={formData.gender}
                            onChange={handleSelectChange('gender')}
                            sx={{
                              borderRadius: 2,
                            }}
                          >
                            <MenuItem value="">Pilih Jenis Kelamin</MenuItem>
                            <MenuItem value="male">Laki-laki</MenuItem>
                            <MenuItem value="female">Perempuan</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.gender === 'male' ? 'Laki-laki' : 
                           user.gender === 'female' ? 'Perempuan' : 'Belum diisi'}
                        </Typography>
                      )}
                    </Grid>

                    {/* Date of Birth */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Tanggal Lahir
                        </Typography>
                      </Box>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={formData.date_of_birth}
                          onChange={handleInputChange('date_of_birth')}
                          variant="outlined"
                          size="small"
                          type="date"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.date_of_birth ? 
                            new Date(user.date_of_birth).toLocaleDateString('id-ID') : 
                            'Belum diisi'}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {/* Address Tab Content */}
        <Box>
          {/* Address Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Alamat Saya
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAddress}
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
              Tambah Alamat
            </Button>
          </Box>

          {/* Address Error */}
          {addressesError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setAddressesError(null)}
            >
              {addressesError}
            </Alert>
          )}

          {/* Address Loading */}
          {addressesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : addresses.length === 0 ? (
            /* Empty State */
            <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <AddressIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  Belum Ada Alamat
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Tambahkan alamat untuk memudahkan proses checkout
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddAddress}
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
                  Tambah Alamat Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Address List */
            <Grid container spacing={3}>
              {addresses.map((address) => (
                <Grid item xs={12} md={6} key={address.id}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary'
                          }}
                        >
                          Alamat Utama
                        </Typography>
                        {address.is_primary && (
                          <Box sx={{ 
                            backgroundColor: 'primary.main', 
                            color: 'white', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            Default
                          </Box>
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {address.address_line}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {address.city}, {address.province} {address.postal_code}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditAddress(address)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        >
                          Edit
                        </Button>
                        {!address.is_primary && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteAddress(address)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          >
                            Hapus
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </TabPanel>

      {/* Address Form Dialog */}
      <Dialog
        open={showAddressDialog}
        onClose={handleAddressFormCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Address Form Error */}
          {addressFormError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setAddressFormError(null)}
            >
              {addressFormError}
            </Alert>
          )}

          {/* Address Form */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alamat Lengkap"
                value={addressFormData.address_line}
                onChange={handleAddressFormChange('address_line')}
                variant="outlined"
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
                label="Kota"
                value={addressFormData.city}
                onChange={handleAddressFormChange('city')}
                variant="outlined"
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
                label="Provinsi"
                value={addressFormData.province}
                onChange={handleAddressFormChange('province')}
                variant="outlined"
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
                label="Kode Pos"
                value={addressFormData.postal_code}
                onChange={handleAddressFormChange('postal_code')}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status Alamat</InputLabel>
                <Select
                  value={addressFormData.is_primary ? 'primary' : 'secondary'}
                  onChange={(e) => setAddressFormData(prev => ({
                    ...prev,
                    is_primary: e.target.value === 'primary'
                  }))}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="primary">Alamat Utama</MenuItem>
                  <MenuItem value="secondary">Alamat Tambahan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleAddressFormCancel}
              disabled={addressFormLoading}
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
              onClick={handleAddressFormSubmit}
              disabled={addressFormLoading}
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
              {addressFormLoading ? <CircularProgress size={20} /> : (editingAddress ? 'Update' : 'Simpan')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}