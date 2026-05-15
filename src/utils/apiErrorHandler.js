import toast from 'react-hot-toast';

/**
 * Centralized API error handler.
 * Extracts meaningful messages from Axios errors and shows toasts.
 *
 * @param {import('axios').AxiosError} error
 * @param {string} [fallbackMessage] — shown when no specific message can be extracted
 * @returns {string} The human-readable error message
 */
export const handleApiError = (error, fallbackMessage = 'Something went wrong') => {
  // Network / timeout — no response from server
  if (!error.response) {
    const msg = error.code === 'ECONNABORTED'
      ? 'Request timed out. Please try again.'
      : 'Network error. Please check your connection.';
    toast.error(msg);
    return msg;
  }

  const { status, data } = error.response;

  // Auth errors
  if (status === 401) {
    const msg = data?.message || 'Session expired. Please log in again.';
    toast.error(msg);
    return msg;
  }

  if (status === 403) {
    const msg = 'You do not have permission for this action.';
    toast.error(msg);
    return msg;
  }

  // Validation errors (ASP.NET Core returns these in a standard shape)
  if (status === 400) {
    if (data?.errors) {
      // ASP.NET Core model-validation shape: { errors: { field: [messages] } }
      const messages = Object.values(data.errors).flat();
      const msg = messages.join('. ');
      toast.error(msg);
      return msg;
    }
    const msg = data?.message || data?.title || 'Invalid request.';
    toast.error(msg);
    return msg;
  }

  // Not found
  if (status === 404) {
    const msg = data?.message || 'Resource not found.';
    toast.error(msg);
    return msg;
  }

  // Conflict (duplicate data, etc.)
  if (status === 409) {
    const msg = data?.message || 'A conflict occurred. Please try again.';
    toast.error(msg);
    return msg;
  }

  // Server errors
  if (status >= 500) {
    const msg = 'Server error. Our team has been notified.';
    toast.error(msg);
    return msg;
  }

  // Catch-all
  const msg = data?.message || fallbackMessage;
  toast.error(msg);
  return msg;
};
