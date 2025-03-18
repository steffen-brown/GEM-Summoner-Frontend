import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import './App.css';  // Import the CSS file

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [location, setLocation] = useState(null); // Phone's summon location
  const [carLocation, setCarLocation] = useState(null); // Car's current location
  const [carStatus, setCarStatus] = useState('IDLE');   // Car status
  const [message, setMessage] = useState('');

  // Default center for Illinois and zoom level
  const defaultCenter = { lat: 40.092811, lng: -88.235669 };
  const defaultZoom = 19;

  // Load the Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDHUyL8f_f13ycvuMmTLrnCWUzrmsAwlGQ', // Replace with your actual key
  });

  // Poll for car status and car location every 3 seconds
  useEffect(() => {
    if (!token) return; // Only poll when logged in
    const interval = setInterval(() => {
      // Fetch car status
      fetch('https://gem-summon-backend.onrender.com/latest-car-status', {
        headers: { Authorization: token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.car_status) {
            setCarStatus(data.car_status);
          }
        })
        .catch((err) => console.error('Error fetching car status:', err));

      // Fetch car location
      fetch('https://gem-summon-backend.onrender.com/latest-car-location', {
        headers: { Authorization: token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.car_location) {
            setCarLocation(data.car_location);
          }
        })
        .catch((err) => console.error('Error fetching car location:', err));
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  // Handle login
  const handleLogin = async () => {
    try {
      const response = await fetch('https://gem-summon-backend.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setMessage('');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Error connecting to the backend');
    }
  };

  // Handle "Summon GEM" by sending the phone's current location
  const handleSummonGEM = async () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser');
    } else {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        try {
          const response = await fetch('https://gem-summon-backend.onrender.com/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
            body: JSON.stringify({ location: coords }),
          });
          if (!response.ok) {
            const data = await response.json();
            setMessage(data.message);
          } else {
            setMessage('');
          }
        } catch (error) {
          setMessage('Error sending location');
        }
      });
    }
  };

  return (
    <div className="app-container">
      <div className='app-center'>
        <h1 className="app-title">GEM Car Summoner</h1>
        {loadError && (
          <p className="app-error">Error loading maps.</p>
        )}

        {!token ? (
          <div className="login-container">
            <h2>Login</h2>
            <input
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            /> <br></br>
            <input
              className="login-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            /> <br></br>
            <button className="login-button" onClick={handleLogin}>
              Login
            </button>
          </div>
        ) : (
          <div className="summon-container">
            {/* Hide the button if car is currently SUMMONING */}
            {carStatus !== 'SUMMONING' && (
              <button className="summon-button" onClick={handleSummonGEM}>
                Summon GEM
              </button>
            )}
            <p className="car-status">Car Status: {carStatus}</p>
          </div>
        )}

        {message && <p className="app-message">{message}</p>}

        {token && isLoaded && !loadError && (
          <div className="map-container">
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={defaultCenter}
              zoom={defaultZoom}
              options={{
                disableDefaultUI: true,
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,
                tilt: 0,
                mapTypeId: 'satellite',
                draggable: false,
                gestureHandling: 'none',
              }}
            >
              {location && (
                <Marker
                  position={location}
                  icon={{
                    url: 'https://www.iconpacks.net/icons/1/free-user-icon-295-thumb.png',
                    scaledSize: new window.google.maps.Size(20, 20),
                  }}
                />
              )}
              {carLocation && (
                <Marker
                  position={carLocation}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/kml/shapes/cabs.png',
                    scaledSize: new window.google.maps.Size(20, 20),
                  }}
                />
              )}
            </GoogleMap>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
