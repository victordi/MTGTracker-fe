import React, {ChangeEvent, FormEvent, ReactElement, useEffect, useState} from "react";
import axios from "axios";
import {API_URL, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";

type Player = {
    name: string,
    decks: object[]
}

const initialValues = {
    player1: "",
    player2: "",
    player3: "",
    player4: "",
    firstPlace: 4,
    secondPlace: 2,
    thirdPlace: 1,
    fourthPlace: 0,
    kill: 2,
    commanderKill: 1,
    infinite: 2,
    bodyGuard: 1
}

export default function CreateSeason(): ReactElement {
    useEffect(() => {
        fetchPlayers().then();
    }, []);

    const [players, setPlayers] = useState<string[]>([]);

    const [formValues, setFormValues] = useState(initialValues);

    const navigation = useNavigate()

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        const body = {
            player1: formValues.player1,
            player2: formValues.player2,
            player3: formValues.player3,
            player4: formValues.player4,
            pointSystem: {
                firstPlace: formValues.firstPlace,
                secondPlace: formValues.secondPlace,
                thirdPlace: formValues.thirdPlace,
                fourthPlace: formValues.fourthPlace,
                kill: formValues.kill,
                commanderKill: formValues.commanderKill,
                infinite: formValues.infinite,
                bodyGuard: formValues.bodyGuard
            }
        }
        const id: number = await axios.post(
            API_URL + "seasons",
            body,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then((result) => result.data.data)
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                return -1
            })
        if (id != -1) navigation( `/seasons/${id}`)
        else alert("Invalid fields")
    };

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
            .catch((reason) => {if (reason.response.status == 401) refreshLogin()})
        setPlayers(data.map((player) => player.name))
    }

    const selectForm = (player: string, value: string) => {
        return (
            <FormControl>
                <InputLabel id={player}>{player}</InputLabel>
                <Select
                    labelId={player}
                    id={player}
                    name={player}
                    value={value}
                    onChange={handleInputChange}
                    label={player}
                >
                    {players.map((player) =>
                        <MenuItem key={player} value={player}>{player}</MenuItem>
                    )}
                </Select>
            </FormControl>
        )
    }

    const textField = (player: string, value: number) => {
        return (
            <TextField
                id={player}
                name={player}
                label={player}
                type="number"
                value={value}
                onChange={handleInputChange}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                { selectForm("player1", formValues.player1) }
                { selectForm("player2", formValues.player2) }
                { selectForm("player3", formValues.player3) }
                { selectForm("player4", formValues.player4) }
                { textField("firstPlace", formValues.firstPlace) }
                { textField("secondPlace", formValues.secondPlace) }
                { textField("thirdPlace", formValues.thirdPlace) }
                { textField("fourthPlace", formValues.fourthPlace) }
                { textField("kill", formValues.kill) }
                { textField("commanderKill", formValues.commanderKill) }
                { textField("infinite", formValues.infinite) }
                { textField("bodyGuard", formValues.bodyGuard) }

                <Button variant="contained" color="primary" type="submit">
                    Create Seasons
                </Button>
            </Stack>
        </form>
    )
}