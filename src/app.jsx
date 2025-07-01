import React, { useState, useEffect } from 'react';
import './index.css';
import NavBar from './components/UI/Navbar/navbar.jsx';
import Register from './components/UI/Registration/Register.jsx';
import Login from './components/UI/Login/Login.jsx';
import Dashboard from './components/UI/Dashboard/Dashboard.jsx';
import axios from 'axios';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Container from 'react-bootstrap/Container';



function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing JWT on mount
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .post('http://localhost:3001/auth/login', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => {
          setUser(response.data.user);
          setLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoggedIn(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <NavBar />
      {!loggedIn && (
        <Container>
          <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" className="mb-3">
            <Tab eventKey="home" title="Login">
              <Login setLoggedIn={setLoggedIn} setUser={setUser} />
            </Tab>
            <Tab eventKey="profile" title="Register">
              <Register setLoggedIn={setLoggedIn} setUser={setUser} />
            </Tab>
            <Tab eventKey="contact" title="Reactor" disabled>
             What is a Reactor?
            </Tab>
          </Tabs>
        </Container>
      )}
      {loggedIn && <Dashboard user={user} />}
    </div>
  );
}

export default App;