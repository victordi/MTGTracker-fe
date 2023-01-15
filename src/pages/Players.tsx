import React, {useState, useEffect, ReactElement} from 'react';
import '../App.css'
import axios from "axios";
import {API_URL, navStyle, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {Link} from "react-router-dom";
import {Button} from "@mui/material";

export type Player = {
    name: string,
    decks: { name: string, tier: string}[]
}

export default function Players(): ReactElement {
    useEffect(() => {
        fetchPlayers().then();
    }, []);

    const [players, setPlayers] = useState<Player[]>([]);

    const fetchPlayers = async () => {
        const data: Player[] = await axios.get(
            API_URL + "players",
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
        setPlayers(data)
    }

    return (
        <div>
            {players.map((player) =>
                <h1 key={player.name}>
                    <Link style={navStyle} to={`/players/${player.name}`}>{player.name}</Link>
                </h1>
            )}
            <Link style={navStyle} to={`/players/create`}>
                <Button variant="contained">Create Player</Button>
            </Link>
        </div>
    )
}