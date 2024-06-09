/**
 * Global context to give marginTop as the size of the status bar
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { NativeModules, Platform } from 'react-native';

const StatusBarHeightContext = createContext<number | undefined>(undefined);

interface StatusBarHeightProviderProps {
  children: ReactNode;
}

export const StatusBarHeightProvider: React.FC<StatusBarHeightProviderProps> = ({ children }) => {
  const [statusBarHeight, setStatusBarHeight] = useState<number>(0);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      NativeModules.StatusBarManager.getHeight(
        (response: { height: number }) => {
          setStatusBarHeight(response.height);
        }
      );
    } else {
      setStatusBarHeight(NativeModules.StatusBarManager.height || 0);
    }
  }, []);

  return (
    <StatusBarHeightContext.Provider value={statusBarHeight}>
      {children}
    </StatusBarHeightContext.Provider>
  );
};

export const useStatusBarHeight = () => {
  const context = useContext(StatusBarHeightContext);
  if (context === undefined) {
    throw new Error('useStatusBarHeight must be used within a StatusBarHeightProvider');
  }
  return context;
};