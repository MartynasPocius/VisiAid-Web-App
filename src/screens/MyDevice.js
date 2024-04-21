import React, {useState, useEffect } from 'react';
import './MyDevice.css'
import { useNavigate } from 'react-router-dom';
import { useBluetoothContext } from './BluetoothContext';


const MyDeviceFunc = () => {

  const { characteristic, setCharacteristic, connectionStatus, setConnectionStatus, device, setDevice, service, setService } = useBluetoothContext();

  let navigate = useNavigate();

  const handleBluetoothClick = async () => {
    if (!navigator.bluetooth){
      alert('Web Bluetooth is not available in this browser!');
      return;
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['00001234-0000-1000-8000-00805f9b34fb']
      });

      await connectToDevice(device);

    } catch (error) {
      console.log('Error: ' + error);
    }
  }

  const connectToDevice = async (device) => {
    try {
      setConnectionStatus('Connecting...');
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('0000abcd-0000-1000-8000-00805f9b34fb');

      setDevice(device); 
      setService(service);
      setCharacteristic(characteristic);
      setConnectionStatus('Connected.');
      console.log(connectionStatus)
    } catch (error) {
      console.log('Connection failed: ' + error);
      setConnectionStatus('Connection failed: ' + error);
    }
  };

  const handleDisconnectClick = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
      setConnectionStatus('Disconnected');
      setDevice(null);
      setService(null);
      setCharacteristic(null);
    } else {
      setConnectionStatus('Device is already disconnected or was never connected.');
    }
  };

  const sendData = async (angle) => {
    if (characteristic && angle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(angle);
        console.log(angle)
        await characteristic.writeValue(data);
      } catch (error) {
        console.log('Sending data failed: ' + error);
        setConnectionStatus('Sending data failed: ' + error);
      }
    } else {
      setConnectionStatus('No device connected or no data to send.');
    }
  };



  const renderConnectButton = () => (
    <div className='nav__device__connect' onClick={handleBluetoothClick}>
      <p>CONNECT</p>
    </div>
  );

  const renderDisconnectButton = () => (
    <div className='nav__device__disconnect' onClick={handleDisconnectClick}>
      <p>DISCONNECT</p>
    </div>
  );


  return (
    <div className='nav__device__container'>
      <div className='nav__device__container__top'>
        <h2>My Device</h2>
      </div>

      <div className='nav__device__container__bottom'>
        {connectionStatus === 'Connected.' ? renderDisconnectButton() : renderConnectButton()} 
        <div className='nav__device__back' onClick={()=>navigate('/')}>
          <p>GO BACK</p>
        </div>
      </div>

    </div>
  );
}



export default MyDeviceFunc;
