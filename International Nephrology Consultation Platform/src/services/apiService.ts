// API Service for backend communication
function getApiBaseUrl(): string {
  try {
    const configured = import.meta.env.VITE_API_URL as string | undefined;
    const hasWindow = typeof window !== 'undefined';
    const curHost = hasWindow ? window.location.hostname : '';
    if (configured) {
      const cfg = new URL(configured);
      const isLoopback = (h: string) => h === 'localhost' || h === '127.0.0.1';
      const sameSite = (h1: string, h2: string) => {
        try {
          const p1 = h1.split('.').slice(-2).join('.');
          const p2 = h2.split('.').slice(-2).join('.');
          return p1 === p2;
        } catch { return false; }
      };
      if (hasWindow) {
        if (isLoopback(curHost) && isLoopback(cfg.hostname)) return `${configured}/api`;
        if (sameSite(curHost, cfg.hostname)) return '/api';
        return '/api';
      }
      return `${configured}/api`;
    }
  } catch {}
  return '/api';
}

const API_BASE_URL = getApiBaseUrl();
export { getApiBaseUrl };

interface ApiResponse<T> {
  success: boolean;
  data?: T & {
    otp?: string;
    fallback?: boolean;
    mock?: boolean;
    user?: any; // For user data returned from registration/login
    pricing?: any; // For pricing data returned from pricing API
  };
  message?: string;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for session
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Generic request method (public)
  async makeRequest<T>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, options);
  }

  // Authentication
  async login(email: string, password: string) {
    console.log('API: Attempting login for:', email);
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('API: Login response:', response);
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // OTP
  async sendOTP(email: string) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otp: string, userData: any) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, userData }),
    });
  }

  // Firebase
  async firebaseLogin(idToken: string) {
    return this.request('/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  // Chat
  async sendChatMessage(message: string, history?: Array<{sender: string, text: string}>) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }

  // Booking
  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getPricing(consultationType: string, country?: string, isFirstTime?: boolean) {
    return this.request('/bookings/pricing', {
      method: 'POST',
      body: JSON.stringify({ consultationType, country, isFirstTime }),
    });
  }

  async getBookings() {
    return this.request('/bookings');
  }

  // Contact
  async sendContactMessage(contactData: any) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
