import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface DimensionsContextProps {
  width: number;
  height: number;
}

const DimensionsContext = createContext<DimensionsContextProps | undefined>(undefined);

export const DimensionsProvider = ({ children }: { children: ReactNode }) => {
  const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const handleChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', handleChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <DimensionsContext.Provider value={{ width: dimensions.width, height: dimensions.height }}>
      {children}
    </DimensionsContext.Provider>
  );
};

export const useDimensions = () => {
  const context = useContext(DimensionsContext);
  if (!context) {
    throw new Error('useDimensions must be used within a DimensionsProvider');
  }
  return context;
};
