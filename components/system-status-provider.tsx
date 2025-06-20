"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { SystemStatusProvider } from "@/components/system-status-provider";

export interface SystemStatusValues {
  smtp: 'checking' | 'connected' | 'disconnected';
  database: 'checking' | 'connected' | 'disconnected';
  localStorage: 'checking' | 'connected' | 'disconnected';
}

interface SystemStatusContextType {
  status: SystemStatusValues;
  checkAllSystems: () => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

interface SystemStatusProviderProps {
  children: ReactNode;
}

export const SystemStatusProvider = ({ children }: SystemStatusProviderProps) => {
  const [status, setStatus] = useState<SystemStatusValues>({
    smtp: 'checking',
    database: 'checking',
    localStorage: 'checking',
  });

  const checkAllSystems = useCallback(() => {
    // TODO: Implement actual checks for SMTP, Database
    // For now, simulate checks
    setStatus({
      smtp: Math.random() > 0.5 ? 'connected' : 'disconnected',
      database: Math.random() > 0.5 ? 'connected' : 'disconnected',
      localStorage: typeof window !== 'undefined' && window.localStorage ? 'connected' : 'disconnected',
    });
  }, []);

  useEffect(() => {
    checkAllSystems();
  }, [checkAllSystems]);

  return (
    <SystemStatusContext.Provider value={{ status, checkAllSystems }}>
      {children}
    </SystemStatusContext.Provider>
  );
};

export const useSystemStatus = (): SystemStatusContextType => {
  const context = useContext(SystemStatusContext);
  if (context === undefined) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
};
