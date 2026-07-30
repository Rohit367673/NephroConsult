interface OTPResponse {
  success: boolean;
  message: string;
  error?: string;
}

class OTPService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Send OTP to email
  async sendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      return {
        success: true,
        message: data.message || 'OTP sent successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: '',
        error: error.message || 'Failed to send OTP',
      };
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<OTPResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      return {
        success: true,
        message: data.message || 'OTP verified successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: '',
        error: error.message || 'Invalid OTP',
      };
    }
  }
}

export const otpService = new OTPService();
