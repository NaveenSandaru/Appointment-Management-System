"use client"

import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type AuthContextType = {
  user: any;
  accessToken: string;
  isLoggedIn: boolean;
  setUser: Dispatch<SetStateAction<any>>;
  setAccessToken: Dispatch<SetStateAction<string>>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: '',
  isLoggedIn: false,
  setUser: () => {},
  setAccessToken: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');

  const isLoggedIn = !!user && !!accessToken;

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoggedIn, setUser, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
