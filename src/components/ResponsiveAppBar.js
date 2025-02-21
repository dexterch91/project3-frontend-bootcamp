import * as React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SignOutButton from "./SignOutButton";
import BACKEND_URL from './constant';
import axios from 'axios';
import Login from './Login';

const pages = ["About", "Contact Us"];

function ResponsiveAppBar() {
 
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null); //store user from auth
  const [userEmail,setUserEmail] = useState("dexterchewxh@hotmail.sg");
  const [userFirstName,setUserFirstName] = useState("Unknown");
  const [userLastName,setUserLastName] = useState("User");
  const [currentFormattedTime, setCurrentFormattedTime] = useState('');
  //Extract "user" details from here
  const { isAuthenticated, getAccessTokenSilently, loginWithPopup, user, logout,onRedirectCallback} =
  useAuth0();
  const [tokenLoaded, setTokenLoaded] = useState(false);
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };




  useEffect(() => {
    const handleUserLogin = async () => {
      try {
        if (isAuthenticated) {
          const accessToken = await getAccessTokenSilently({
            audience: process.env.AUDIENCE,
            scope: 'read:current_user',
          });

          console.log('Access Token:', accessToken);
          console.log('Logged-in User Details:', JSON.stringify(user));

          // Update user state with user information
          // Assuming you have these state setters available
          setLoggedInUser(user);
          setUserEmail(user.email);
          setUserFirstName(user.given_name);
          setUserLastName(user.family_name);

          // Set tokenLoaded to true when the token is successfully loaded
          setTokenLoaded(true);
        }
      } catch (error) {
        console.error('Error in user login', error);
        // Handle the error, possibly by displaying a user-friendly message.
        // Set tokenLoaded to true even in case of an error, to avoid repeated attempts
        setTokenLoaded(true);
      }
    };

    // Call the function to handle user login when the component mounts
    handleUserLogin();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  
  useEffect(() => {
    // Function to fetch exercise data based on user's email
  const fetchTargetData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/target?email=${userEmail}`);

      if (res.status === 200) {
        // console.log(`Data: ${JSON.stringify(res.data.tbl_target_pefs[0].end_date)}`)
        setUserFirstName(res.data.first_name) //sets the user first name
        setUserLastName(res.data.last_name) //sets the user last name
        // console.log("Fetched User Data")
       
      } else {
        console.error('Failed to fetch exercise data.');
      }
    } catch (error) {
      console.error('Error fetching exercise data:', error);
    }
  };

    if (userEmail) {
      // Fetch exercise data when userEmail state changes
      fetchTargetData();
    }
  }, [userEmail]);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      setCurrentFormattedTime(`${hours}:${minutes}:${seconds}`);
    };

    // Update the current time initially and every second
    updateCurrentTime();
    const intervalId = setInterval(updateCurrentTime, 1000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  //Process achievements
  useEffect(() => {
    // Function to fetch exercise data based on user's email
  const fetchAward = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/addachievement?email=${userEmail}`);

      if (res.status === 200) {
        // console.log(`Data: ${JSON.stringify(res.data.tbl_target_pefs[0].end_date)}`)
        console.log(`Award?: ${res.data}`)
       
      } else {
        console.error('Failed to fetch awards.');
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  };

    if (userEmail) {
      // Fetch exercise data when userEmail state changes
      fetchAward();
    }
  }, [userEmail]);

  return (
    <AppBar position="static">
      {/* {console.log(JSON.stringify(currentUser))}
      {console.log(currentUser?.photoURL)} */}
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <FitnessCenterIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            ArmyFit360
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <FitnessCenterIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            ArmyFit360
          </Typography>
          {!isAuthenticated && (
            <Button
              component={Login}
              to='/login'
              sx={{
                my: 2,
                color: 'white',
                display: 'block',
              }}
            >
              Login
            </Button>
          )}
          {isAuthenticated && (
            <Button
              onClick={() => {
                logout({ returnTo: window.location.origin + '/react-auth0' });
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Sign Out
            </Button>
          )}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
        {userEmail && (
          <>
            <Typography variant="h6" textAlign="right">
              {`Time: ${currentFormattedTime}`}
            </Typography>
            <Typography variant="body1" textAlign="right">
              {`Welcome back, ${userFirstName} ${userLastName}`}
            </Typography>
          </>
        )}
      </Box>
          
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
