import React, {useState, useEffect, ReactElement} from 'react';
import '../App.css'
import axios from "axios";
import {API_URL, AT_STORAGE} from "../constants";

type Season = {
    id: number
    players: object[]
}

function Seasons(): ReactElement {
    useEffect(() => {
        fetchItems().then();
    }, []);

    const [seasons, setSeasons] = useState<Season[]>([]);

    const fetchItems = async () => {
        const data: Season[] = await axios.get(
            API_URL + "seasons",
            )
            .then((result) => result.data.data)
            .catch((reason) => {
                if(reason.response.status == 401) {
                    console.log("Failed auth -> cleaning localStorage")
                    localStorage.removeItem(AT_STORAGE)
                }
                return []
            } )
        setSeasons(data)
    }


    return (
        <div>
            {seasons.map((season) =>
                <h1 key={season.id}>{season.id}</h1>
            )}
        </div>
    )
}


export default Seasons;