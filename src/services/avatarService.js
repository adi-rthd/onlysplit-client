import client from '../api/client';

/**
 * Avatar Service
 * Handles avatar file upload via multipart/form-data.
 */
const avatarService = {
  /**
   * POST /api/users/avatar
   * Uploads a new avatar image.
   * @param {File} file - The image file to upload
   * @returns {{ avatarUrl: string }}
   */
  uploadAvatar: async (file) => {
    // Client-side size guard (prevents sending large files to server)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw { status: 413, message: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is 5 MB.` };
    }

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await client.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data;
  },
};

export default avatarService;
