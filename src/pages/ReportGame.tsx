import React, { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";
import axios from "axios";
import { API_URL, refreshLogin } from "../constants";
import AuthService from "../service/auth-service";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

interface Player {
  name: string;
  decks: object[];
};

interface FormValues {
  playerNames: string[];
  deckNames: string[];
  places: number[];
  startOrders: number[];
  kills: number[];
  commanderKills: number[];
  infinite: boolean[];
  bodyGuards: number[];
  penalties: number[];
};

interface RadioGroupFieldProps {
  label: string;
  name: keyof FormValues;
  options: number[];
  value: number;
  index: number;
};

export default function ReportGame(): ReactElement {
  const { id } = useParams();

  const initialValues: FormValues = {
    playerNames: ["", "", "", ""],
    deckNames: ["", "", "", ""],
    places: [1, 2, 3, 4],
    startOrders: [1, 2, 3, 4],
    kills: [0, 0, 0, 0],
    commanderKills: [0, 0, 0, 0],
    infinite: [false, false, false, false],
    bodyGuards: [0, 0, 0, 0],
    penalties: [0, 0, 0, 0]
  };

  useEffect(() => {
    fetchPlayers().then();
  }, []);

  const [players, setPlayers] = useState<string[]>([]);
  const [decks, setDecks] = useState<string[][]>([[], [], [], []]);
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [currentPage, setCurrentPage] = useState<string>("select-players");

  const navigation = useNavigate();

  const handleNext = async () => {
    if (currentPage === "select-players") {
      // Fetch decks for each selected player
      for (let i = 0; i < 4; i++) {
        const playerName = formValues.playerNames[i];
        const decksForPlayer = await fetchDecks(playerName);

        // Update the decks state
        setDecks((prevDecks) => {
          const newDecks = [...prevDecks];
          newDecks[i] = decksForPlayer;
          return newDecks;
        });

        setFormValues(formValues => ({
          ...formValues,
          deckNames: [
            ...formValues.deckNames.slice(0, i),
            decksForPlayer[0],
            ...formValues.deckNames.slice(i + 1)
          ]
        }));
      }

      // Update the page state and navigate to the next page
      setCurrentPage("select-decks");
    } else if (currentPage === "select-decks") {
      // Navigate to the next page
      setCurrentPage("input-stats");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Handle the submit logic for each game entry
    const addedGames: number[] = []
    for (let i = 0; i < 4; i++) {
      const gameEntry = {
        playerName: formValues.playerNames[i],
        deckName: formValues.deckNames[i],
        place: formValues.places[i],
        startOrder: formValues.startOrders[i],
        kills: formValues.kills[i],
        commanderKills: formValues.commanderKills[i],
        infinite: formValues.infinite[i],
        bodyGuard: formValues.bodyGuards[i],
        penalty: formValues.penalties[i]
      };

      const failed: boolean = await axios.post(
        API_URL + `seasons/${id}/results`,
        gameEntry,
        {
          headers: {
            Authorization: AuthService.loggedUserAT()
          }
        }
      )
        .then((body) => {
          addedGames.push(parseInt(body.data.data, 10) || -1);
          return false;
        })
        .catch((reason) => {
          if (reason.response.status === 401) refreshLogin();
          return true;
        });

      if (failed) {
        alert(`Invalid fields for player ${gameEntry.playerName}`);
        addedGames
          .filter(gameId => gameId != -1)
          .forEach(gameId => {
            axios.delete(API_URL + `seasons/${id}/results/${gameId}`,
              { headers: { Authorization: AuthService.loggedUserAT() } })
              .catch((reason) => { if (reason.response.status === 401) refreshLogin() });
            console.log(`Deleted ${gameId}`);
          })
        return; // Stop processing if there's a failure
      }
    }

    // If all submissions are successful, navigate to the desired page
    navigation(`/seasons/${id}`);
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
      .catch((reason) => { if (reason.response.status === 401) refreshLogin() });

    setPlayers(data.map((player) => player.name));
    setFormValues(formValues => ({
      ...formValues,
      playerNames: [data[0].name, data[1].name, data[2].name, data[3].name]
    }));
  };

  const fetchDecks = async (playerName: string) => {
    const data: { name: string, tier: string }[] = await axios.get(
      API_URL + `players/${playerName}/decks`,
      {
        headers: {
          Authorization: AuthService.loggedUserAT()
        }
      }
    )
      .then((result) => result.data.data)
      .catch((reason) => { if (reason.response.status === 401) refreshLogin() });

    return data.map((deck) => deck.name);
  };

  const RadioGroupField = ({
    label,
    name,
    options,
    value,
    index,
  }: RadioGroupFieldProps): ReactElement => {
    const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
      const updatedValue = parseInt(event.target.value, 10) || 0;
      setFormValues(prevFormValues => ({
        ...prevFormValues,
        [name]: prevFormValues[name].map((val, idx) => idx === index ? updatedValue : val)
      }));
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormLabel component="legend" style={{ width: '100px', marginRight: '20px' }}>
          {label}
        </FormLabel>
        <RadioGroup
          row
          aria-label={label}
          name={`${name}${index}`}
          value={value.toString()}
          onChange={handleRadioChange}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option}
              value={option.toString()}
              control={<Radio />}
              label={option.toString()}
            />
          ))}
        </RadioGroup>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <br />
      {currentPage === "select-players" && (
        <Stack spacing={2}>
          <div>
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <FormControl>
                  <InputLabel id={`player${index + 1}`}>{`Player ${index + 1}`}</InputLabel>
                  <Select
                    labelId={`player${index + 1}`}
                    id={`player${index + 1}`}
                    name="playerNames"
                    value={formValues.playerNames[index]}
                    onChange={(e) => setFormValues({
                       ...formValues,
                       playerNames: [
                         ...formValues.playerNames.slice(0, index),
                         e.target.value,
                         ...formValues.playerNames.slice(index + 1)
                       ]
                     })}
                    label={`Player ${index + 1}`}
                  >
                    {players.map((player) => (
                      <MenuItem key={player} value={player}>{player}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            ))}
          </div>

          <Button variant="contained" color="primary" onClick={handleNext}>
            Continue to Decks
          </Button>
        </Stack>
      )}

      {currentPage === "select-decks" && (
        <Stack spacing={2}>
          <div>
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <FormControl>
                  <InputLabel id={`deck${index}`}>{`${formValues.playerNames[index]}\`s Deck`}</InputLabel>
                  <Select
                    labelId={`deck${index}`}
                    id={`deck${index}`}
                    name="deckNames"
                    value={formValues.deckNames[index]}
                    onChange={(e) => setFormValues({
                      ...formValues,
                      deckNames: [
                        ...formValues.deckNames.slice(0, index),
                        e.target.value,
                        ...formValues.deckNames.slice(index + 1)
                      ]
                    })}
                    label={`${formValues.playerNames[index]}\`s Deck`}
                  >
                    {decks[index].map((deck) => (
                      <MenuItem key={deck} value={deck}>{deck}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            ))}
          </div>

          <Button variant="contained" color="primary" onClick={handleNext}>
            Continue to Stats
          </Button>
        </Stack>
      )}

      {currentPage === "input-stats" && (
        <Stack spacing={2}>
          <div>
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <h1>{formValues.playerNames[index]}</h1>

                <RadioGroupField
                  label="Place"
                  name="places"
                  options={[1, 2, 3, 4]}
                  value={formValues.places[index]}
                  index={index}
                />

                <RadioGroupField
                  label="Order"
                  name="startOrders"
                  options={[1, 2, 3, 4]}
                  value={formValues.startOrders[index]}
                  index={index}
                />

                <RadioGroupField
                  label="Kills"
                  name="kills"
                  options={[0, 1, 2, 3]}
                  value={formValues.kills[index]}
                  index={index}
                />

                <RadioGroupField
                  label="Commander Kills"
                  name="commanderKills"
                  options={[0, 1, 2, 3]}
                  value={formValues.commanderKills[index]}
                  index={index}
                />

                <RadioGroupField
                  label="Bodyguard"
                  name="bodyGuards"
                  options={[0, 1, 2, 3]}
                  value={formValues.bodyGuards[index]}
                  index={index}
                />

                {/* Infinite Field */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={formValues.infinite[index]}
                      onChange={(e) => setFormValues({
                        ...formValues,
                        infinite: [
                          ...formValues.infinite.slice(0, index),
                          e.target.checked,
                          ...formValues.infinite.slice(index + 1)
                        ]
                      })}
                    />
                  }
                  label={`Infinite Combo`}
                />

                {/* Penalties Field */}
                <TextField
                  label={`Penalties`}
                  type="number"
                  value={formValues.penalties[index]}
                  onChange={(e) => setFormValues({
                    ...formValues,
                    penalties: [
                      ...formValues.penalties.slice(0, index),
                      parseInt(e.target.value, 10) || 0,
                      ...formValues.penalties.slice(index + 1)
                    ]
                  })}
                />
              </div>

            ))}
          </div>

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      )}
    </form>
  );
}
