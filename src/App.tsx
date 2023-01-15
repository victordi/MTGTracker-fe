import React, {FC, ReactElement} from 'react';
import {ThemeProvider, CssBaseline} from "@mui/material";
import {customTheme} from "./theme/customTheme";
import Nav from "./pages/Nav";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import Seasons from "./pages/Seasons";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import SeasonDetails from "./pages/SeasonDetails";
import CreateSeason from "./pages/CreateSeason";
import Players from "./pages/Players";
import PlayerDetails from "./pages/PlayerDetails";
import CreateDeck from "./pages/CreateDeck";
import CreatePlayer from "./pages/CreatePlayer";
import ReportGame from "./pages/ReportGame";
import GameResults from "./pages/GameResults";

const App: FC = (): ReactElement => {
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline/>
            <Router>
                <Nav/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/seasons" element={<PrivateRoute outlet={<Seasons/>}/>}/>
                    <Route path="/seasons/:id" element={<PrivateRoute outlet={<SeasonDetails/>}/>}/>
                    <Route path="/seasons/:id/games" element={<PrivateRoute outlet={<GameResults/>}/>}/>
                    <Route path="/seasons/:id/reportGame" element={<PrivateRoute outlet={<ReportGame/>}/>}/>
                    <Route path="/seasons/create" element={<PrivateRoute outlet={<CreateSeason/>}/>}/>
                    <Route path="/players" element={<PrivateRoute outlet={<Players/>}/>}/>
                    <Route path="/players/create" element={<PrivateRoute outlet={<CreatePlayer/>}/>}/>
                    <Route path="/players/:name" element={<PrivateRoute outlet={<PlayerDetails/>}/>}/>
                    <Route path="/players/:name/createDeck" element={<PrivateRoute outlet={<CreateDeck/>}/>}/>
                </Routes>
            </Router>
        </ThemeProvider>
    )
};


export default App;
