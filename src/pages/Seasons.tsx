import React, {useState, useEffect, ReactElement} from 'react';
import '../App.css'
import axios from "axios";
import {API_URL, navStyle, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {Link} from "react-router-dom";
import {Button} from "@mui/material";

function Seasons(): ReactElement {
    useEffect(() => {
        fetchSeasons().then();
    }, []);

    const [seasons, setSeasons] = useState<{ id: number }[]>([]);

    const fetchSeasons = async () => {
        const data: { id: number }[] = await axios.get(
            API_URL + "seasons",
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then((result) => result.data.data)
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
            })
        setSeasons(data)
    }

    return (
        <div>
            {seasons.map((season) =>
                <h2 key={season.id}>
                    <Link style={navStyle} to={`/seasons/${season.id}`}>Season {seasons.indexOf(season) + 1}</Link>
                </h2>
            )}
            <Link style={navStyle} to={`/seasons/create`}>
                <Button variant="contained">Create new season</Button>
            </Link>
        </div>
    )
}


export default Seasons;