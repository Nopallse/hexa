import axiosInstance from './axiosInstance';
import { UploadResponse } from '@/types';

export const uploadService = {
  // Upload single file
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<{ data: UploadResponse }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  // Upload multiple files
  uploadFiles: async (files: File[]): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await axiosInstance.post<{ data: UploadResponse[] }>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  // Delete file
  deleteFile: async (filename: string): Promise<void> => {
    await axiosInstance.delete(`/upload/${filename}`);
  },
};
