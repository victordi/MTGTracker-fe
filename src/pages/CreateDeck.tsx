import React, {ChangeEvent, FormEvent, ReactElement, useState} from "react";
import axios from "axios";
import {API_URL, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";

const initialValues = {
    name: "",
    tier: ""
}

export default function CreateDeck(): ReactElement {
    const {name} = useParams()
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
        const failed: boolean = await axios.post(
            API_URL + `players/${name}/decks`,
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
                else alert("Invalid fields")
                return true
            })
        if(!failed) navigation( `/players/${name}`)
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <TextField
                    id="name-input"
                    name="name"
                    label="Name"
                    type="text"
                    value={formValues.name}
                    onChange={handleInputChange}
                />
                <FormControl>
                    <InputLabel id="tier">tier</InputLabel>
                    <Select
                        labelId="tier"
                        id="tierInput"
                        name="tier"
                        value={formValues.tier}
                        onChange={handleInputChange}
                        label="tier"
                    >
                        <MenuItem key="tier1" value="I">I</MenuItem>
                        <MenuItem key="tier2" value="II">II</MenuItem>
                        <MenuItem key="tier3" value="III">III</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" type="submit">
                    Create Deck
                </Button>
            </Stack>
        </form>
    )
}