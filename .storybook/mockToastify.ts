// Mock for react-toastify
const toast = {
  success: (message: string) => console.log('Toast success:', message),
  error: (message: string) => console.log('Toast error:', message),
  info: (message: string) => console.log('Toast info:', message),
  warning: (message: string) => console.log('Toast warning:', message),
};

export { toast }; 