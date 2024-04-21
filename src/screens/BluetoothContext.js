import React, { createContext, useContext, useState } from 'react';

const BluetoothContext = createContext();

export const useBluetoothContext = () => useContext(BluetoothContext);

export const BluetoothProvider = ({ children }) => {
  const [characteristic, setCharacteristic] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [device, setDevice] = useState(null);
  const [service, setService] = useState(null);

  return (
    <BluetoothContext.Provider value={{ characteristic, setCharacteristic, connectionStatus, setConnectionStatus, device, setDevice, service, setService }}>
      {children}
    </BluetoothContext.Provider>
  );
};
