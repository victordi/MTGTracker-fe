import React, {ReactElement, useEffect, useState} from 'react';
import '../App.css'
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {API_URL, navStyle, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import JSONPretty from "react-json-pretty";
import {Button, Stack,} from "@mui/material";
import {Player} from "./Players";
import {DeckStats, Stats} from "./SeasonDetails";

type PlayerStats = {
    playerName: string,
    avgDeckStats: DeckStats[],
    avgStats: Stats[],
    deckStatsPerSeason: { first: number, second: DeckStats[]}[],
    statsPerSeason: { first: number, second: Stats[]}[]
}

export default function PlayerDetails(): ReactElement {
    const {name} = useParams()
    const navigation = useNavigate()

    useEffect(() => {
        fetchPlayer().then();
        fetchPlayerStats().then();
    }, []);

    const [player, setPlayer] = useState<Player>({name: "", decks: []});
    const [playerStats, setPlayerStats] = useState<PlayerStats>({playerName: "", avgDeckStats: [], avgStats: [], deckStatsPerSeason: [], statsPerSeason: []});

    const fetchPlayer = async () => {
        const data: Player = await axios.get(
            API_URL + `players/${name}`,
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
        setPlayer(data)
    }

    const fetchPlayerStats = async () => {
        const data: PlayerStats = await axios.get(
            API_URL + `players/${name}/stats`,
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
        console.log(data)
        setPlayerStats(data)
    }

    const promote = async (deck: { name: string, tier: string}) => {
        await axios.patch(
            API_URL + `players/${name}/decks`,
            {
                name: deck.name,
                tier: deck.tier.slice(0, deck.tier.length - 1)
            },
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then(() => window.location.reload())
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                else alert("Already top tier")
            })
        window.location.reload()
    }

    const demote = async (deck: { name: string, tier: string}) => {
        await axios.patch(
            API_URL + `players/${name}/decks`,
            {
                name: deck.name,
                tier: deck.tier.padEnd(deck.tier.length + 1, 'I')
            },
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then(() => window.location.reload())
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                else alert("Already bot tier")
            })
    }

    const remove = async (deckName: string) => {
        await axios.delete(
            API_URL + `players/${name}/decks/${deckName}`,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then(() => window.location.reload())
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                else alert("Delete failed")
            })
    }

    const removePlayer = async () => {
        const failed: boolean = await axios.delete(
            API_URL + `players/${name}`,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then(() => { return false })
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                else alert("Delete failed")
                return true
            })
        if (!failed) navigation("/players")
    }

    return (
        <div>
            <h1 key={player.name}>
                <Stack spacing={4}>
                    <text>{player.name}</text>
                    {player.decks.map((deck) =>
                        <Stack key={`stack${deck.name}`} direction="row" spacing={6}>
                            <text>{deck.name} with tier {deck.tier}</text>
                            <Button variant="contained" onClick={() => promote(deck)}>Promote</Button>
                            <Button variant="contained" onClick={() => demote(deck)}>Demote</Button>
                            <Button variant="contained" onClick={() => remove(deck.name)}>Delete</Button>
                        </Stack>
                    )}
                </Stack>
            </h1>
            <Stack direction="row" spacing={8}>
                <Link style={navStyle} to={`/players/${name}/createDeck`}>
                    <Button variant="contained">Create Deck</Button>
                </Link>
                <Button variant="contained" onClick={removePlayer}>Delete Player</Button>
            </Stack>
            <JSONPretty key={1} data={playerStats}/>
        </div>
    )
}