import toast from 'react-hot-toast';

/**
 * Standardized error handler for API requests.
 * Parses the error response and shows a user-friendly toast.
 * Returns a standardized error object.
 */
export const handleApiError = (error, customMessage = null) => {
  console.error("API Error:", error);

  let message = customMessage || "An unexpected error occurred. Please try again.";
  let status = 500;
  let validationErrors = null;

  if (error.response) {
    status = error.response.status;
    const data = error.response.data;

    // Handle standard ASP.NET Core Validation Problem Details
    if (status === 400 && data.errors) {
      validationErrors = data.errors;
      // Get the first error message
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && data.errors[firstKey].length > 0) {
        message = data.errors[firstKey][0];
      } else {
        message = "Validation failed. Please check your input.";
      }
    } 
    // Handle standard generic error message
    else if (data && data.message) {
      message = data.message;
    }
    // Handle specific status codes
    else if (status === 401) {
      message = "Session expired or unauthorized. Please log in again.";
    } else if (status === 403) {
      message = "You do not have permission to perform this action.";
    } else if (status === 404) {
      message = "The requested resource was not found.";
    }
  } else if (error.request) {
    message = "Network error. Please check your connection.";
  }

  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });

  return {
    success: false,
    message,
    status,
    validationErrors,
    originalError: error
  };
};
