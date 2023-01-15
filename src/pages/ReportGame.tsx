import React, {ChangeEvent, FormEvent, ReactElement, useEffect, useState} from "react";
import axios from "axios";
import {API_URL, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Switch,
    TextField
} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";

type Player = {
    name: string,
    decks: object[]
}


export default function ReportGame(): ReactElement {
    const {id} = useParams()

    const initialValues = {
        playerName: "",
        deckName: "",
        place: 4,
        startOrder: 4,
        kills: 0,
        commanderKills: 0,
        infinite: false,
        bodyGuard: 0,
        penalty: 0
    }

    useEffect(() => {
        fetchPlayers().then();
    }, []);

    const [players, setPlayers] = useState<string[]>([]);

    const [decks, setDecks] = useState<string[]>([]);

    const [formValues, setFormValues] = useState(initialValues);

    const navigation = useNavigate()

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
        if (name == "playerName") {
            formValues.deckName = ""
            fetchDecks(value).then()
        }
    };

    const handeSwitchChange = (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { name } = e.target
        setFormValues({
            ...formValues,
            [name]: checked,
        });
    }

    const handleSubmit = async (event: FormEvent) => {
        console.log(formValues)
        event.preventDefault()
        const failed: boolean = await axios.post(
            API_URL + `seasons/${id}/results`,
            formValues,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then(() => { return false })
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                return true
            })
        if (!failed) navigation( `/seasons/${id}`)
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

    const fetchDecks = async (playerName: string) => {
        const data: { name: string, tier: string }[] =  await axios.get(
            API_URL + `players/${playerName}/decks`,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then((result) => result.data.data)
            .catch((reason) => {if (reason.response.status == 401) refreshLogin()})
        console.log(data)
        setDecks(data.map((deck) => deck.name))
    }

    return (
        <form onSubmit={handleSubmit}>
            <br/>
            <Stack spacing={2}>
                <FormControl>
                    <InputLabel id="playerName">playerName</InputLabel>
                    <Select
                        labelId="playerName"
                        id="playerName"
                        name="playerName"
                        value={formValues.playerName}
                        onChange={handleInputChange}
                        label="playerName"
                    >
                        {players.map((player) =>
                            <MenuItem key={player} value={player}>{player}</MenuItem>
                        )}
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel id="deckName">deckName</InputLabel>
                    <Select
                        labelId="deckName"
                        id="deckName"
                        name="deckName"
                        value={formValues.deckName}
                        onChange={handleInputChange}
                        label="deckName"
                    >
                        {decks.map((deck) =>
                            <MenuItem key={deck} value={deck}>{deck}</MenuItem>
                        )}
                    </Select>
                </FormControl>

                <TextField
                    id="place-input"
                    name="place"
                    label="place"
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 4} }}
                    value={formValues.place}
                    onChange={handleInputChange}
                />

                <TextField
                    id="startOrder-input"
                    name="startOrder"
                    label="startOrder"
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 4} }}
                    value={formValues.startOrder}
                    onChange={handleInputChange}
                />

                <TextField
                    id="kills-input"
                    name="kills"
                    label="Kills"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 3} }}
                    value={formValues.kills}
                    onChange={handleInputChange}
                />

                <TextField
                    id="commanderKills-input"
                    name="commanderKills"
                    label="commanderKills"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 3} }}
                    value={formValues.commanderKills}
                    onChange={handleInputChange}
                />

                <Switch
                    name="infinite"
                    checked={formValues.infinite}
                    onChange={handeSwitchChange}
                />

                <TextField
                    id="bodyGuard-input"
                    name="bodyGuard"
                    label="bodyGuard"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 10} }}
                    value={formValues.bodyGuard}
                    onChange={handleInputChange}
                />

                <TextField
                    id="penalty-input"
                    name="penalty"
                    label="penalty"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 10} }}
                    value={formValues.penalty}
                    onChange={handleInputChange}
                />

                <Button variant="contained" color="primary" type="submit">
                    Report Game
                </Button>
            </Stack>
        </form>
    )
}