import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Build as HandmadeIcon,
  Favorite as FavoriteIcon,
  Nature as EcoIcon,
  Groups as GroupsIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
} from '@mui/icons-material';

export default function AboutPage() {
  const theme = useTheme();

  const values = [
    {
      icon: <HandmadeIcon sx={{ fontSize: '2.5rem', color: 'primary.main' }} />,
      title: 'Handmade Quality',
      description: 'Setiap produk dibuat dengan tangan menggunakan teknik crochet tradisional yang telah teruji kualitasnya.'
    },
    {
      icon: <EcoIcon sx={{ fontSize: '2.5rem', color: 'success.main' }} />,
      title: 'Eco-Friendly',
      description: 'Kami menggunakan bahan-bahan ramah lingkungan dan proses produksi yang berkelanjutan.'
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: '2.5rem', color: 'error.main' }} />,
      title: 'Made with Love',
      description: 'Setiap jahitan dibuat dengan penuh cinta dan perhatian untuk memberikan yang terbaik bagi pelanggan.'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: '2.5rem', color: 'info.main' }} />,
      title: 'Community Support',
      description: 'Kami mendukung komunitas lokal dengan memberikan pelatihan dan kesempatan kerja bagi ibu-ibu rumah tangga.'
    }
  ];

  const features = [
    {
      icon: <StarIcon sx={{ fontSize: '1.5rem', color: 'warning.main' }} />,
      title: 'Premium Quality',
      description: 'Produk berkualitas tinggi dengan standar internasional'
    },
    {
      icon: <ShippingIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />,
      title: 'Fast Shipping',
      description: 'Pengiriman cepat dan aman ke seluruh Indonesia'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: '1.5rem', color: 'success.main' }} />,
      title: 'Secure Payment',
      description: 'Pembayaran aman dengan berbagai metode pembayaran'
    },
    {
      icon: <SupportIcon sx={{ fontSize: '1.5rem', color: 'info.main' }} />,
      title: '24/7 Support',
      description: 'Customer service siap membantu Anda kapan saja'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & Lead Designer',
      image: '/images/team/sarah.jpg',
      description: 'Pecinta crochet sejak kecil, Sarah memulai Hexa Crochet dengan visi untuk menghadirkan produk handmade berkualitas tinggi.'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Production Manager',
      image: '/images/team/maria.jpg',
      description: 'Ahli dalam teknik crochet tradisional, Maria memastikan setiap produk memenuhi standar kualitas tertinggi.'
    },
    {
      name: 'Lisa Chen',
      role: 'Quality Control',
      image: '/images/team/lisa.jpg',
      description: 'Bertanggung jawab untuk memastikan setiap produk yang keluar dari workshop dalam kondisi sempurna.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Produk Terjual' },
    { number: '200+', label: 'Pelanggan Puas' },
    { number: '3', label: 'Tahun Pengalaman' },
    { number: '15', label: 'Artisan Terlatih' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 3 }}>
          Tentang Hexa Crochet
        </Typography>
        <Typography variant="h5" color="text.secondary" className="craft-body" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          Kami adalah komunitas pengrajin crochet yang berdedikasi untuk menciptakan produk handmade berkualitas tinggi 
          dengan desain modern dan teknik tradisional yang telah teruji.
        </Typography>
        <Chip 
          label="Handmade with Love Since 2021" 
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 600,
            px: 2,
            py: 1,
            fontSize: '1rem'
          }} 
        />
      </Box>

      {/* Stats Section */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                border: '1px solid rgba(150, 130, 219, 0.08)',
                textAlign: 'center',
                p: 3
              }}>
                <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Our Story */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 3 }}>
              Cerita Kami
            </Typography>
            <Typography variant="body1" color="text.secondary" className="craft-body" sx={{ mb: 3 }}>
              Hexa Crochet dimulai dari kecintaan terhadap seni crochet tradisional. 
              Sebagai seorang pengrajin yang telah berkecimpung dalam dunia crochet selama bertahun-tahun, 
              kami melihat potensi besar untuk menghadirkan produk handmade berkualitas tinggi dengan desain modern.
            </Typography>
            <Typography variant="body1" color="text.secondary" className="craft-body" sx={{ mb: 3 }}>
              Dengan menggabungkan teknik tradisional dan desain kontemporer, 
              kami menciptakan produk yang tidak hanya indah tetapi juga fungsional. 
              Setiap produk dibuat dengan penuh perhatian dan cinta, 
              memastikan kualitas yang konsisten dan daya tahan yang tinggi.
            </Typography>
            <Typography variant="body1" color="text.secondary" className="craft-body">
              Kami percaya bahwa produk handmade memiliki nilai lebih dari sekadar barang konsumsi. 
              Setiap produk membawa cerita, emosi, dan kehangatan yang tidak dapat ditemukan dalam produk massal.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(150, 130, 219, 0.15)'
            }}>
              <img
                src="/images/about/workshop.jpg"
                alt="Hexa Crochet Workshop"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Our Values */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 6, textAlign: 'center' }}>
          Nilai-Nilai Kami
        </Typography>
        
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                border: '1px solid rgba(150, 130, 219, 0.08)',
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(150, 130, 219, 0.16)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 3 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="craft-body">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Our Team */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 6, textAlign: 'center' }}>
          Tim Kami
        </Typography>
        
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                border: '1px solid rgba(150, 130, 219, 0.08)',
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(150, 130, 219, 0.16)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar
                    src={member.image}
                    alt={member.name}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mx: 'auto', 
                      mb: 3,
                      border: '4px solid',
                      borderColor: 'primary.light'
                    }}
                  />
                  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={500} sx={{ mb: 2 }}>
                    {member.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="craft-body">
                    {member.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Why Choose Us */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 6, textAlign: 'center' }}>
          Mengapa Memilih Hexa Crochet?
        </Typography>
        
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(150, 130, 219, 0.08)',
                border: '1px solid rgba(150, 130, 219, 0.08)',
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box sx={{ 
        textAlign: 'center',
        p: 6,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(150, 130, 219, 0.1) 0%, rgba(150, 130, 219, 0.05) 100%)',
        border: '1px solid rgba(150, 130, 219, 0.1)'
      }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading" sx={{ mb: 2 }}>
          Bergabunglah dengan Komunitas Kami
        </Typography>
        <Typography variant="h6" color="text.secondary" className="craft-body" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Ikuti perjalanan kami dalam menciptakan produk crochet berkualitas tinggi 
          dan dapatkan inspirasi untuk proyek crochet Anda sendiri.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Chip 
            label="Instagram: @hexacrochet" 
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              px: 2,
              py: 1,
              fontSize: '1rem'
            }} 
          />
          <Chip 
            label="YouTube: @hexacrochet" 
            sx={{ 
              backgroundColor: 'error.main',
              color: 'white',
              fontWeight: 600,
              px: 2,
              py: 1,
              fontSize: '1rem'
            }} 
          />
          <Chip 
            label="Shopee: hexacrochet" 
            sx={{ 
              backgroundColor: '#EE4D2D',
              color: 'white',
              fontWeight: 600,
              px: 2,
              py: 1,
              fontSize: '1rem'
            }} 
          />
        </Stack>
      </Box>
    </Container>
  );
}
