import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function NavBar() {
  return (
    <Navbar bg="dark" variant="dark" className="mb-4">
      <Container>
        <Navbar.Brand href="#home">CRYPTEX|LABS - Reactor</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" color='white'/>
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Add any additional navigation items here if needed */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default NavBar;