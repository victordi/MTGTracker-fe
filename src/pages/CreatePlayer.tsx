import React, {ChangeEvent, FormEvent, ReactElement, useState} from "react";
import axios from "axios";
import {API_URL, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {Button, SelectChangeEvent, Stack, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";

const initialValues = {
    name: ""
}

export default function CreatePlayer(): ReactElement {
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
        const name: string = await axios.post(
            API_URL + `players`,
            formValues,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then((response) => { return response.data.data })
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                else alert("Invalid fields")
                return ""
            })
        navigation( `/players/${name}`)
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
                <Button variant="contained" color="primary" type="submit">
                    Create Player
                </Button>
            </Stack>
        </form>
    )
}