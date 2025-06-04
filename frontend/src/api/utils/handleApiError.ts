export const handleApiError = (error: any): never => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || 'Server responded with an error';
    throw new Error(`Error ${status}: ${message}`);
  } else if (error.request) {
    throw new Error('No response from the server');
  } else {
    throw new Error('An unexpected error occurred while fetching data');
  }
};
