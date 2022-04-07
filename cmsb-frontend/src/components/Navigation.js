import React, { useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Navigation(props) {

    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="/"></Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Link to="/create">Create New Contract</Link>
                    </Nav>
                    <Nav className="me-auto">
                        <Link to="/contracts">View Contracts</Link>
                    </Nav>
                    <Nav>
                        {
                            props.account === undefined &&
                            <Nav><Button onClick={props.connectWallet}>Connect Wallet</Button></Nav>
                        }
                        {
                            props.account &&
                            <Nav style={{color: 'white'}}>{ props.account.substring(0, 15) }{ props.account.length >= 10 && `.....` }</Nav>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}