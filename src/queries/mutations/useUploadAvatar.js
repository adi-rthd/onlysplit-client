import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import avatarService from '../../services/avatarService';
import { useAuthStore } from '../../store/authStore';

/**
 * Mutation hook for uploading a user avatar.
 * On success: updates the auth store user with the new avatarUrl.
 */
export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file) => avatarService.uploadAvatar(file),

    onSuccess: (data) => {
      // Update avatar in auth store immediately
      const { user, setUser } = useAuthStore.getState();
      if (user) {
        setUser({ ...user, avatarUrl: data.avatarUrl });
      }
      toast.success('Avatar uploaded successfully.');
    },

    onError: (err) => {
      toast.error('File is too large. Please choose an image under 5 MB.', { icon: 'ℹ️' });
    },
  });
}
