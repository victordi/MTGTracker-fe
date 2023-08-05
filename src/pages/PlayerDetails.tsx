import React, {ReactElement, useEffect, useState} from 'react';
import '../App.css'
import Tabs from '../components/Tabs';
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {API_URL, navStyle, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {Button, Stack,} from "@mui/material";
import {Player} from "./Players";
import StatsTable, {Stats, DeckStats, StatsRow, EMPTY_STATS, toStatsRow} from "../components/StatsTable";
import {useConfirm} from "material-ui-confirm";

type PlayerStats = {
    playerName: string,
    avgDeckStats: DeckStats[],
    avgStats: Stats,
    deckStatsPerSeason: { first: number, second: DeckStats[] }[],
    statsPerSeason: { first: number, second: Stats }[]
}

export default function PlayerDetails(): ReactElement {
    const {name} = useParams()
    const navigation = useNavigate()
    const confirm = useConfirm()

    useEffect(() => {
        fetchPlayer().then();
        fetchPlayerStats().then();
        fetchSeasons().then()
    }, []);

    const [player, setPlayer] = useState<Player>({name: "", decks: []});
    const [playerStats, setPlayerStats] = useState<PlayerStats>({
        playerName: "",
        avgDeckStats: [],
        avgStats: EMPTY_STATS,
        deckStatsPerSeason: [],
        statsPerSeason: []
    });
    const [seasons, setSeasons] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<string>('Player Info');

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const tabs = ['Player Info', 'Player Stats'];

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
        setSeasons(data.map((it) => it.id))
    }

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

    const promote = async (deck: { name: string, tier: string }) => {
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

    const demote = async (deck: { name: string, tier: string }) => {
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
        confirm({description: `Are you sure you want to delete deck: ${deckName}?`})
            .then(async () => {
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
            })
    }

    const removePlayer = async () => {
        confirm({description: `Are you sure you want to delete player: ${name}`})
            .then(async () => {
                const failed: boolean = await axios.delete(
                    API_URL + `players/${name}`,
                    {
                        headers: {
                            Authorization: AuthService.loggedUserAT()
                        }
                    }
                )
                    .then(() => {
                        return false
                    })
                    .catch((reason) => {
                        if (reason.response.status == 401) refreshLogin()
                        else alert("Delete failed")
                        return true
                    })
                if (!failed) navigation("/players")
            })
    }

    const prepareStats = (): StatsRow[] => {
        const response: StatsRow[] = []
        response.push(toStatsRow(playerStats.avgStats, "Total"))
        playerStats.avgDeckStats
            .map((deckStats) => response.push(toStatsRow(deckStats.stats, deckStats.deckName)))
        playerStats.statsPerSeason
            .map((seasonStats) =>
                response.push(toStatsRow(seasonStats.second, `Season ${seasons.indexOf(seasonStats.first) + 1}`))
            )
        playerStats.deckStatsPerSeason.map((stats) => {
                const seasonNumber = seasons.indexOf(stats.first) + 1
                stats.second.map((deckStats) =>
                    response.push(toStatsRow(deckStats.stats, `Season ${seasonNumber} | ${deckStats.deckName}`))
                )
            }
        )
        return response
    }

    return (
        <div>
            <Tabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange} />
            {activeTab === 'Player Info' && (
                <div>
                    <Stack spacing={4}>
                        <h1>{player.name}</h1>
                        {player.decks.map((deck) =>
                            <h6 key={`stack${deck.name}`}>
                                <Stack key={`stack${deck.name}`} direction="row" spacing={1}>
                                    <h2>{deck.name} with tier {deck.tier}</h2>
                                    <Button variant="contained" onClick={() => promote(deck)}>Promote</Button>
                                    <Button variant="contained" onClick={() => demote(deck)}>Demote</Button>
                                    <Button variant="contained" onClick={() => remove(deck.name)}>Delete</Button>
                                </Stack>
                            </h6>
                        )}
                    </Stack>
                    <br/>
                    <br/>
                    <br/>
                    <Stack direction="row" spacing={8}>
                        <Link style={navStyle} to={`/players/${name}/createDeck`}>
                            <Button variant="contained">Create Deck</Button>
                        </Link>
                        <Button variant="contained" onClick={removePlayer}>Delete Player</Button>
                    </Stack>
                    <br/>
                </div>
            )}
            {activeTab === 'Player Stats' && (
                <div>
                    <StatsTable stats={prepareStats()}/>
                </div>
            )}
        </div>
    )
}