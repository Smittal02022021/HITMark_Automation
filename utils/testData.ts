/**
 * Centralised test data. Pull credentials/secrets from environment
 * variables (set in .env.<env>) rather than hardcoding them here.
 */
export const users = {
  validUser: {
    username: process.env.TEST_USERNAME || 'testuser',
    password: process.env.TEST_PASSWORD || 'testpassword',
  },
};
