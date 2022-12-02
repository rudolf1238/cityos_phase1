import React, { useContext } from 'react';

// TODO
export const MyContext = React.createContext<{
  isvalue: string;
  setIsvalue: React.Dispatch<React.SetStateAction<string>>;
  isvaluestate: string;
  setIsvaluestate: React.Dispatch<React.SetStateAction<string>>;
}>({ isvalue: '', setIsvalue: () => {}, isvaluestate: '', setIsvaluestate: () => {} }); // null這裡是放預設值

export function useMyContext() {
  return useContext(MyContext);
}
