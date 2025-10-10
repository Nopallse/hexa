import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  RestoreFromTrash as DeletedIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { getProductImageUrl } from '@/utils/image';
import { Product } from '@/features/products/types';

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => Promise<void>;
  onView: (product: Product) => void;
  onViewDeleted?: () => void;
}

export default function ProductTable({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onViewDeleted,
}: ProductTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    product: Product | null;
    loading: boolean;
  }>({
    open: false,
    product: null,
    loading: false,
  });

  const handleDeleteClick = (product: Product) => {
    setDeleteDialog({
      open: true,
      product,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await onDelete(deleteDialog.product.id);
      setDeleteDialog({ open: false, product: null, loading: false });
    } catch (error) {
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, product: null, loading: false });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: idLocale });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPrimaryImage = (product: Product) => {
    if (product.product_images && product.product_images.length > 0) {
      const primaryImage = product.product_images.find(img => img.is_primary);
      return primaryImage || product.product_images[0];
    }
    return null;
  };

  if (products.length === 0 && !isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Belum ada produk
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Tambah produk pertama untuk mulai menjual
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* Action Bar */}
      {onViewDeleted && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<DeletedIcon />}
            onClick={onViewDeleted}
            color="secondary"
          >
            Lihat Produk Dihapus
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gambar</TableCell>
              <TableCell>Nama Produk</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell align="right">Harga</TableCell>
              <TableCell align="center">Stok</TableCell>
              <TableCell align="center">Pre-order</TableCell>
              <TableCell align="center">Info Varian</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const primaryImage = getPrimaryImage(product);
              
              return (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Avatar
                      src={getProductImageUrl(primaryImage?.image_name)}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      <ProductIcon />
                    </Avatar>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {product.description || '-'}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={product.category?.name || 'Tidak ada kategori'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="right">
                    {product.product_variants && product.product_variants.length > 0 ? (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" fontWeight="medium" color="primary">
                          {formatPrice(Math.min(...product.product_variants.map(v => parseFloat(v.price))))} - {formatPrice(Math.max(...product.product_variants.map(v => parseFloat(v.price))))}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" fontWeight="medium">
                        {formatPrice(parseFloat(product.price || '0'))}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {product.product_variants && product.product_variants.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                        <Chip 
                          label={`Total: ${product.product_variants.reduce((sum, v) => sum + (v.stock || 0), 0)}`}
                          size="small"
                          color={product.product_variants.reduce((sum, v) => sum + (v.stock || 0), 0) > 0 ? 'success' : 'error'}
                          variant={product.product_variants.reduce((sum, v) => sum + (v.stock || 0), 0) > 0 ? 'filled' : 'outlined'}
                        />
                      </Box>
                    ) : (
                      <Chip 
                        label={product.stock || 0}
                        size="small"
                        color={(product.stock || 0) > 0 ? 'success' : 'error'}
                        variant={(product.stock || 0) > 0 ? 'filled' : 'outlined'}
                      />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Chip 
                      label={`${product.pre_order || 0} hari`}
                      size="small"
                      color={product.pre_order && product.pre_order > 0 ? 'warning' : 'default'}
                      variant={product.pre_order && product.pre_order > 0 ? 'filled' : 'outlined'}
                    />
                  </TableCell>

                  <TableCell align="center">
                    {product.product_variants && product.product_variants.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                        <Chip 
                          label={`${product.product_variants.length} Varian`}
                          size="small"
                          color="primary"
                          variant="filled"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    ) : (
                      <Chip
                        label="Tidak Ada Varian"
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </TableCell>


                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Lihat Detail">
                        <IconButton
                          size="small"
                          onClick={() => onView(product)}
                          color="info"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Produk">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(product)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Hapus Produk">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(product)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Hapus Produk</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Anda yakin ingin menghapus produk <strong>{deleteDialog.product?.name}</strong>?
            </Typography>
          </Alert>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Produk akan dihapus secara soft delete dan dapat dipulihkan nanti.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleteDialog.loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteDialog.loading}
          >
            {deleteDialog.loading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
