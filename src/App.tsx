import React, {FC, ReactElement} from 'react';
import {ThemeProvider, CssBaseline} from "@mui/material";
import {customTheme} from "./theme/customTheme";
import AuthService from "./service/auth-service";
import Nav from "./pages/Nav";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import Seasons from "./pages/Seasons";
import Home from "./pages/Home";
import axios from "axios";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";

const App: FC = (): ReactElement => {
    axios.defaults.headers.common['Authorization'] = AuthService.loggedUserAT()
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline/>
            <Router>
                <Nav/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/seasons" element={<PrivateRoute outlet={<Seasons/>}/>}/>
                </Routes>
            </Router>
        </ThemeProvider>)
};


export default App;
