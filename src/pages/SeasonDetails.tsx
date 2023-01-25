import React, {ReactElement, useEffect, useState} from 'react';
import '../App.css'
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {API_URL, navStyle, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {Button, Stack} from "@mui/material";
import StatsTable, {SeasonStats, StatsRow, toStatsRow} from "../components/StatsTable";
import {useConfirm} from "material-ui-confirm";

type Season = {
    id: number
    players: { first: string, second: number }[]
}

export default function SeasonDetails(): ReactElement {
    const {id} = useParams()
    const navigation = useNavigate()
    const confirm = useConfirm()

    useEffect(() => {
        fetchSeason().then();
    }, []);

    const [season, setSeason] = useState<Season>({id: 0, players: []});
    const [seasonStats, setSeasonStats] = useState<SeasonStats>([])

    const fetchSeason = async () => {
        const data: Season = await axios.get(
            API_URL + `seasons/${id}`,
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
        setSeason(data)

        const stats: SeasonStats = await axios.get(
            API_URL + `seasons/${id}/stats`,
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
        setSeasonStats(stats)
    }

    const deleteSeason = async () => {
        confirm({description: `Are you sure you want to delete this season?`})
            .then(async () => {
                await axios.delete(
                    API_URL + `seasons/${id}`,
                    {
                        headers: {
                            Authorization: AuthService.loggedUserAT()
                        }
                    }
                )
                    .catch((reason) => {
                        if (reason.response.status == 401) refreshLogin()
                        else alert("Failed to delete season: " + reason)
                    })
                navigation("/seasons")
            })
    }

    const prepareStats = (): StatsRow[] => {
        const response: StatsRow[] = []
        seasonStats.map((playerStats) => {
            response.push(toStatsRow(playerStats.second.avgStats, playerStats.first))
            playerStats.second.deckStats.map((deckStat) =>
                response.push(toStatsRow(deckStat.stats, `${playerStats.first} | ${deckStat.deckName}`))
            )
        })
        return response
    }

    return (
        <div>
            <h1>Season {id}</h1>
            {season.players.map((player) =>
                <h2 key={player.first}>{player.first} with {player.second} points.</h2>
            )}
            <Stack direction="row" spacing={8}>
                <Button variant="contained" onClick={deleteSeason}>Delete Season</Button>
                <Link style={navStyle} to={`/seasons/${id}/games`}>
                    <Button variant="contained">View Games</Button>
                </Link>
                <Link style={navStyle} to={`/seasons/${id}/reportGame`}>
                    <Button variant="contained">Report Game Result</Button>
                </Link>
            </Stack>
            {StatsTable(prepareStats())}
        </div>
    )
}