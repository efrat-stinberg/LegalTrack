// Password reset: request a link by email, check a link, and set the new password
import { apiClient } from './config';

export const requestPasswordReset = (email: string) => apiClient.post('/password/forgot', { email });

export const validateResetToken = async (token: string): Promise<{ email: string }> =>
  (await apiClient.post('/password/validate', { token })).data;

export const resetPassword = (token: string, password: string) => apiClient.post('/password/reset', { token, password });
