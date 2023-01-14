import React, {useState, useEffect, ReactElement} from 'react';
import '../App.css'
import axios from "axios";
import {API_URL, AT_STORAGE, navStyle} from "../constants";
import AuthService from "../service/auth-service";
import {Link} from "react-router-dom";

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
                if (reason.response.status == 401) {
                    console.log("Failed auth -> cleaning localStorage")
                    localStorage.removeItem(AT_STORAGE)
                }
                return []
            })
        setSeasons(data)
    }


    return (
        <div>
            {seasons.map((season) =>
                <h2 key={season.id}>
                    <Link style={navStyle} to={`/seasons/${season.id}`}>Season{season.id}</Link>
                </h2>
            )}
        </div>
    )
}


export default Seasons;