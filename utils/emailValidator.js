const SECE_EMAIL_REGEX = /^[^\s@]+@sece\.ac\.in$/i;

/**
 * Validates normal email shape and restricts registration/login to SECE mail.
 */
export const isValidSeceEmail = (email = '') => {
  return SECE_EMAIL_REGEX.test(String(email).trim());
};

export const normalizeEmail = (email = '') => {
  return String(email).trim().toLowerCase();
};
