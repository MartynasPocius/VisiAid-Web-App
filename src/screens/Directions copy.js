import React, {useState, useEffect, useRef} from 'react';
import { BluetoothProvider, useBluetoothContext  } from './BluetoothContext';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import './Directions.css'

const containerStyle = {
  width: '100%',
  height: '100%'
};


const Directions = () => {
  const { characteristic, setCharacteristic, connectionStatus, setConnectionStatus, device, setDevice, service, setService } = useBluetoothContext(); // Access the characteristic
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [conversionDone, setConversionDone] = useState(false);
  const [pathCoordinates, setPathCoordinates] = useState(null);
  const [pathDirections, setPathDirections] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  let navigate = useNavigate();


  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const lastDestinationRef = useRef(inputValue); // ref to store the last submitted destination

  useEffect(() => {

    

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCurrentLocation({
            lat: coords.latitude,
            lng: coords.longitude
          });
        },
        (error) => {
          alert("Geolocation is not supported by this browser.");
        }
      );
    }
  }, []);


  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleDestinationSubmit = (e) => {
    console.log('CLICKED')
    e.preventDefault();
    if (inputValue && inputValue !== lastDestinationRef.current) { // check if the destination is new
      setDirectionsResponse(null); // Clear previous directions
      lastDestinationRef.current = inputValue; // Update the last destination
      fetchDirections(currentLocation, inputValue); // Fetch new directions
      setSubmitted(true);
    }
  };

  const fetchDirections = (origin, newDestination) => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: newDestination,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);

          // Extract coordinates from the steps and store them in an array
          const route = result.routes[0];
          const coordinates = [];
          for (let i = 0; i < route.legs.length; i++) {
            const steps = route.legs[i].steps;
            for (let j = 0; j < steps.length; j++) {
              const path = steps[j].path;
              for (let k = 0; k < path.length; k++) {
                coordinates.push({
                  lat: path[k].lat(),
                  lng: path[k].lng()
                });
              }
            }
          }

          setPathCoordinates(coordinates)
          const directionsWithRespectToNorth = calculateDirectionsWithRespectToNorth(coordinates);
          setPathDirections(directionsWithRespectToNorth)
          console.log('Directions:', directionsWithRespectToNorth);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  };

  const handleCoordinateConversion = (e) => {
    //const directionsWithRespectToNorth = calculateDirectionsWithRespectToNorth(pathCoordinates);
    //console.log('Directions with respect to north:', directionsWithRespectToNorth);
    console.log('Angles:', pathDirections);
    // Send coordinate - angle pairs to Arduino
    //
    // 
    //sendData()
    setConversionDone(true);
    setIsTrackingActive(true);
  };

  const sendData = async () => {
    if (characteristic && inputValue) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(inputValue);
        await characteristic.writeValue(data);
        setConnectionStatus(`Data sent: ${inputValue}`);
      } catch (error) {
        console.log('Sending data failed: ' + error);
        setConnectionStatus('Sending data failed: ' + error);
      }
    } else {
      setConnectionStatus('No device connected or no data to send.');
    }
  };

  const calculateDirectionsWithRespectToNorth = (coordinates) => {
    const directions = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const startPoint = coordinates[i];
      const endPoint = coordinates[i + 1];
      const direction = calculateDirection(startPoint, endPoint);
      //directions.push(direction);
      directions.push({
        coordinate: startPoint,
        angle: direction
      })
    }
    return directions;
  };

  const calculateDirection = (startPoint, endPoint) => {
    const latDiff = endPoint.lat - startPoint.lat;
    const lngDiff = endPoint.lng - startPoint.lng;
    const angle = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
    return angle >= 0 ? angle : 360 + angle;
  };

  const handleDecline = () => {
    console.log('Decline button clicked');
    // Restart everything and reset all the states
    //
    //
  };

  return (
    <div className='directions__box'>
      <div className='nav__device__container__top'>
        <h2>Directions</h2>
      </div>
      <div className = 'directions__map__box'>

      <LoadScript
        googleMapsApiKey='AIzaSyC0Bf23eVc3q6yqxhWkqEiZHqKa_62jlRs'
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || { lat: -3.745, lng: -38.523 }}
          zoom={10}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {directionsResponse && <DirectionsRenderer options={{ directions: directionsResponse }} />}
        </GoogleMap>
      </LoadScript>

      </div>
      <input type="text" value={inputValue} onChange={handleInputChange} placeholder="Enter text to send"/>

      {submitted ? (
        <div className='directions__submit__box' onClick={conversionDone ? handleDecline : handleCoordinateConversion} style={{ backgroundColor: conversionDone ? '#FF0000' : '#00FFA4' }}>
          <p>{conversionDone ? 'DECLINE' : 'CONFIRM'}</p>
        </div>
      ) : (
        <div className='directions__submit__box' onClick={handleDestinationSubmit}>
          <p>SUBMIT</p>
        </div>
      )}

      <div className='directions__back__box' onClick={()=>navigate('/')}>
          <p>GO BACK</p>
        </div>
    </div>
  );
}

export default Directions;
