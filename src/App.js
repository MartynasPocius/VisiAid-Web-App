import React, {useState} from 'react';
import './App.css';
import { 
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';
import MyDevice from './screens/MyDevice';
import Directions from './screens/Directions';
import { BluetoothProvider, useBluetoothContext  } from './screens/BluetoothContext';

function App() {

  let navigate = useNavigate();
  const { characteristic, setCharacteristic, connectionStatus, setConnectionStatus, device, setDevice, service, setService } = useBluetoothContext(); // Access the characteristic

  return (
    <div className="app">
      <div className='device__container' onClick={()=>navigate('/my-device')}>
        <h1>My Device</h1>
      </div>
      <div className='directions__container' onClick={()=>navigate('/directions')}>
        <h1>Directions</h1>
      </div>
    </div>
  );
}

export default function AppWrapper(){
  return(
    <BrowserRouter>
    <BluetoothProvider>
      <Routes>
        <Route path = '/' element = {<App/>}/>
        <Route path = '/my-device' element = {<MyDevice/>}/>
        <Route path = '/directions' element = {<Directions/>}/>
      </Routes>
    </BluetoothProvider>
    </BrowserRouter>
  );
}