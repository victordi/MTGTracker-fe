import React, {ReactElement, useEffect, useState} from 'react';
import '../App.css'
import {useParams} from "react-router-dom";
import axios from "axios";
import {API_URL, AT_STORAGE} from "../constants";
import AuthService from "../service/auth-service";
import JSONPretty from "react-json-pretty";

type Season = {
    id: number
    players: { first: string, second: number }[]
}

type Stats = {
    gamesPlayed: number,
    gamesWon: number,
    gamesWonWhenFirst: number,
    gamesWonWhenSecond: number,
    gamesWonWhenThird: number,
    gamesWonWhenFourth: number,
    gamesWonWithInfinite: number,
    avgPlace: number,
    avgKills: number,
    avgCommanderKills: number
}

type SeasonStats = { first: string, second: {avgStats: Stats, deckStats: { deckName: string, stats: Stats}[]}}[]

export default function SeasonDetails(): ReactElement {
    const { id } = useParams()

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
                if (reason.response.status == 401) {
                    console.log("Failed auth -> cleaning localStorage")
                    localStorage.removeItem(AT_STORAGE)
                }
                return []
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
                if (reason.response.status == 401) {
                    console.log("Failed auth -> cleaning localStorage")
                    localStorage.removeItem(AT_STORAGE)
                }
                return "{}"
            })
        setSeasonStats(stats)
    }

    return (
        <div>
            <h1>Season {id}</h1>
            {season.players.map((player) =>
                <h2 key={player.first}>{player.first} with {player.second} points.</h2>
            )}
            <h1>Stats</h1>
            {seasonStats.map((pair) =>
                <h3 key={pair.first}>
                    Player: {pair.first}
                    <JSONPretty key={1} data={pair.second}/>
                </h3>
            )}
        </div>
    )
}