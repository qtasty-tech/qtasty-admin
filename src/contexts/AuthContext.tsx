import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (formData: RegisterFormData) => Promise<void>;
  token: string | null;
};

type AuthProviderProps = {
  children: ReactNode;
};

type LoginResponse = {
  token: string;
};

type RegisterFormData = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = jwtDecode<User>(storedToken);
      setUser(decoded);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>('http://localhost:8080/api/user/login', {
        email,
        password
      });
      
      const { token } = response.data;
      const decoded = jwtDecode<User>(token);
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(decoded);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (formData: RegisterFormData) => {
    try {
      await axios.post('http://localhost:8080/api/user/register', formData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, token }}>
      {children}
    </AuthContext.Provider>
  );
};