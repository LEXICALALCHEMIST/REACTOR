  import React, { useState } from 'react';
  import { getSkel } from '../../../../Nuerom/ZTRL/getSkel.js';
  import Container from 'react-bootstrap/Container';
  import Tab from 'react-bootstrap/Tab';
  import Tabs from 'react-bootstrap/Tabs';
  import WalletView from '../../Views/walletView.jsx';
  import SendView from '../../Views/sendView.jsx';
  import ReceiveView from '../../Views/receiveView.jsx';

  import './Dashboard.css';

  function Dashboard({ user }) {
  const [userData, setUserData] = useState(user);

  const handleSendComplete = async (newSKEL) => {
    console.log('Send complete, refreshing UI');
    try {
      const current_skel = await getSkel(userData.id);
      setUserData({ ...userData, current_skel });
      console.log(`Dashboard: Updated current_skel to ${current_skel}`);
    } catch (error) {
      console.error('Dashboard: Failed to refresh current_skel:', error.message);
    }
  };

  const handleReceiveComplete = async (newSKEL) => {
    console.log('Receive complete, refreshing UI');
    try {
      const current_skel = await getSkel(userData.id);
      setUserData({ ...userData, current_skel });
      console.log(`Dashboard: Updated current_skel to ${current_skel}`);
    } catch (error) {
      console.error('Dashboard: Failed to refresh current_skel:', error.message);
    }
  };

  return (
    <Container className="dashboard">
      <Tabs
        defaultActiveKey="home"
        transition={false}
        id="noanim-tab-example"
        className="mb-3"
      >
        <Tab eventKey="home" title="Home">
          <WalletView user={userData} />
        </Tab>
        <Tab eventKey="profile" title="Send">
          <SendView userId={userData?.id} onSendComplete={handleSendComplete} />
        </Tab>
        <Tab eventKey="contact" title="Receive">
          <ReceiveView userId={userData?.id} onReceiveComplete={handleReceiveComplete} />
        </Tab>
      </Tabs>
    </Container>
  );
}

export default Dashboard;