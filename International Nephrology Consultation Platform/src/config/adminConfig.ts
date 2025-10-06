// Admin Configuration
// Centralized admin email management for the application

export const ADMIN_EMAILS = [
  'suyambu54321@gmail.com',
  'rohit367673@gmail.com'
];

// Function to check if an email is an admin email
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Function to get all admin emails (for reference)
export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};

// Add new admin email (for future use)
export const addAdminEmail = (email: string): void => {
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    ADMIN_EMAILS.push(email.toLowerCase());
  }
};

// Remove admin email (for future use)
export const removeAdminEmail = (email: string): void => {
  const index = ADMIN_EMAILS.indexOf(email.toLowerCase());
  if (index > -1) {
    ADMIN_EMAILS.splice(index, 1);
  }
};
