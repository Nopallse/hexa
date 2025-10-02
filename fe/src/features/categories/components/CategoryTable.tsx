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
  Category as CategoryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Category } from '@/types/global';
import { getCategoryImageUrl } from '@/utils/image';

interface CategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => Promise<void>;
  onView: (category: Category) => void;
  onViewDeleted?: () => void;
}

export default function CategoryTable({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onViewDeleted,
}: CategoryTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    category: Category | null;
    loading: boolean;
  }>({
    open: false,
    category: null,
    loading: false,
  });

  const handleDeleteClick = (category: Category) => {
    setDeleteDialog({
      open: true,
      category,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await onDelete(deleteDialog.category.id);
      setDeleteDialog({ open: false, category: null, loading: false });
    } catch (error) {
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, category: null, loading: false });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: idLocale });
  };

  if (categories.length === 0 && !isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Belum ada kategori
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Tambah kategori pertama untuk mulai mengorganisir produk
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
            Lihat Kategori Dihapus
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="80">Gambar</TableCell>
              <TableCell>Nama Kategori</TableCell>
              <TableCell>Deskripsi</TableCell>
              <TableCell align="center">Jumlah Produk</TableCell>
              <TableCell>Tanggal Dibuat</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>
                  <Avatar
                    src={getCategoryImageUrl((category as any).image)}
                    alt={category.name}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  >
                    <CategoryIcon />
                  </Avatar>
                </TableCell>
                
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {category.name}
                  </Typography>
                </TableCell>
                
                <TableCell>
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
                    {category.description || '-'}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip 
                    label={category.products?.length || 0}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatDate(category.created_at)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Lihat Detail">
                      <IconButton
                        size="small"
                        onClick={() => onView(category)}
                        color="info"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit Kategori">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(category)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Hapus Kategori">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(category)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
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
        <DialogTitle>Hapus Kategori</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Anda yakin ingin menghapus kategori <strong>{deleteDialog.category?.name}</strong>?
            </Typography>
          </Alert>
          
          {deleteDialog.category?.products && deleteDialog.category.products.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Kategori ini memiliki {deleteDialog.category.products.length} produk. 
                Menghapus kategori akan mempengaruhi produk-produk tersebut.
              </Typography>
            </Alert>
          )}
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Tindakan ini tidak dapat dibatalkan.
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
