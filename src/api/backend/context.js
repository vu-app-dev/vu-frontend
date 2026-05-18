import { createContext, useContext } from 'react';

export const BackendContext = createContext(null);

export function useBackendData() {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackendData must be used inside BackendProvider.');
  }
  return context;
}
