export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'THERAPIST' | 'ADMIN';
  isVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
  verify: (email: string, otp: string) => Promise<void>;
}



