import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  useTheme,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  ShoppingCart as ShopeeIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContactPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <LocationIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
      title: 'Alamat',
      content: 'Jl. Raya Bogor KM 47, Cibinong, Bogor, Jawa Barat 16911',
      action: 'Lihat di Maps'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
      title: 'Telepon',
      content: '+62 812-3456-7890',
      action: 'Hubungi Sekarang'
    },
    {
      icon: <EmailIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
      title: 'Email',
      content: 'info@hexacrochet.com',
      action: 'Kirim Email'
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
      title: 'Jam Operasional',
      content: 'Senin - Jumat: 09:00 - 17:00\nSabtu: 09:00 - 15:00',
      action: null
    }
  ];

  const socialMedia = [
    {
      name: 'Instagram',
      icon: <InstagramIcon sx={{ fontSize: '1.5rem' }} />,
      handle: '@hexacrochet',
      url: 'https://www.instagram.com/hexacrochet',
      color: '#E4405F'
    },
    {
      name: 'TikTok',
      icon: <img src="/images/tiktok.svg" alt="Shopee" style={{ width: 24, height: 24, display: 'block' }} />,
      handle: '@hexacrochet',
      url: 'https://www.tiktok.com/@hexacrochet',
      color: '#000000'
    },
    {
      name: 'YouTube',
      icon: <YouTubeIcon sx={{ fontSize: '1.5rem' }} />,
      handle: '@hexacrochet',
      url: 'https://www.youtube.com/@hexacrochet',
      color: '#FF0000'
    },
    {
      name: 'Shopee',
      icon: <img src="/images/logo-shopee.svg" alt="Shopee" style={{ width: 24, height: 24, display: 'block' }} />,
      handle: 'hexacrochet',
      url: 'https://shopee.co.id/hexacrochet',
      color: '#EE4D2D'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 2 }}>
          Hubungi Kami
        </Typography>
        <Typography variant="h6" color="text.secondary" className="craft-body" sx={{ maxWidth: 600, mx: 'auto' }}>
          Ada pertanyaan tentang produk crochet kami? Ingin custom order? 
          Jangan ragu untuk menghubungi tim Hexa Crochet!
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} color="text.primary" className="craft-heading" sx={{ mb: 3 }}>
              Informasi Kontak
            </Typography>
            
            <Grid container spacing={3}>
              {contactInfo.map((info, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                    border: '1px solid rgba(150, 130, 219, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(150, 130, 219, 0.16)',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {info.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                        {info.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                        {info.content}
                      </Typography>
                      {info.action && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(150, 130, 219, 0.05)',
                              borderColor: 'primary.dark'
                            }
                          }}
                        >
                          {info.action}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Social Media */}
          <Box>
            <Typography variant="h5" fontWeight={600} color="text.primary" className="craft-heading" sx={{ mb: 3 }}>
              Ikuti Kami
            </Typography>
            
            
          </Box>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            border: '1px solid rgba(150, 130, 219, 0.08)',
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} color="text.primary" className="craft-heading" sx={{ mb: 3 }}>
                Kirim Pesan
              </Typography>
              
              {submitStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Pesan berhasil dikirim! Kami akan segera menghubungi Anda.
                </Alert>
              )}
              
              {submitStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    name="name"
                    label="Nama Lengkap"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  
                  <TextField
                    name="subject"
                    label="Subjek"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  
                  <TextField
                    name="message"
                    label="Pesan"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={<SendIcon />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px rgba(150, 130, 219, 0.15)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(150, 130, 219, 0.2)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {socialMedia.map((social, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(150, 130, 219, 0.08)',
                border: '1px solid rgba(150, 130, 219, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: social.color }}>
                    {social.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight={600} color="text.primary">
                      {social.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {social.handle}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.open(social.url, '_blank')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: social.color,
                      color: social.color,
                      '&:hover': {
                        backgroundColor: `${social.color}10`,
                        borderColor: social.color
                      }
                    }}
                  >
                    Kunjungi
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* FAQ Section */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 4, textAlign: 'center' }}>
          Pertanyaan yang Sering Diajukan
        </Typography>
        
        <Grid container spacing={3}>
          {[
            {
              question: 'Berapa lama waktu pembuatan custom order?',
              answer: 'Waktu pembuatan custom order biasanya 7-14 hari kerja, tergantung kompleksitas desain dan jumlah item yang dipesan.'
            },
            {
              question: 'Apakah tersedia pengiriman ke luar negeri?',
              answer: 'Ya, kami melayani pengiriman ke berbagai negara di Asia Tenggara dan internasional dengan estimasi waktu 5-21 hari.'
            },
            {
              question: 'Bagaimana cara merawat produk crochet?',
              answer: 'Produk crochet kami dapat dicuci dengan tangan menggunakan air dingin dan sabun lembut, kemudian dijemur di tempat teduh.'
            },
            {
              question: 'Apakah ada garansi untuk produk?',
              answer: 'Kami memberikan garansi 30 hari untuk cacat produksi. Untuk kerusakan akibat penggunaan normal, kami tidak memberikan garansi.'
            }
          ].map((faq, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(150, 130, 219, 0.08)',
                border: '1px solid rgba(150, 130, 219, 0.08)',
                height: '100%'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                    {faq.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="craft-body">
                    {faq.answer}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
