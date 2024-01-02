import React, { FormEvent, ReactElement, useEffect, useState } from "react";
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

interface GameData {
  playerName: string;
  deckName: string;
  place: number;
  startOrder: number;
  kills: number;
  commanderKills: number;
  infinite: boolean;
  bodyGuard: number;
  penalty: number;
};

interface FormValues {
  games: GameData[]
};

interface RadioGroupFieldProps {
  label: string;
  name: keyof GameData;
  options: number[];
  value: number;
  index: number;
};

export default function ReportGame(): ReactElement {
  const { id } = useParams();

  const initialValues: FormValues = {
    games: Array(4).fill(null).map(() => ({
      playerName: '',
      deckName: '',
      place: 1,
      startOrder: 1,
      kills: 0,
      commanderKills: 0,
      infinite: false,
      bodyGuard: 0,
      penalty: 0,
    })),
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
      const deckFetchPromises = formValues.games.map(game => fetchDecks(game.playerName));
      const decksForAllPlayers = await Promise.all(deckFetchPromises);
      decksForAllPlayers.forEach((decks, index) => {
        setDecks((prevDecks) => {
          const newDecks = [...prevDecks];
          newDecks[index] = decks;
          return newDecks;
        });
        updateFormValues(index, 'deckName', decks[0])
      })

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
      const gameEntry = formValues.games[i]

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

  const updateFormValues = (idx: number, label: keyof GameData, value: number | string | boolean) => {
    setFormValues(prevFormValues => {
      const updatedGames = prevFormValues.games.map((game, index) => {
        if (index === idx) {
          return { ...game, [label]: value };
        }
        return game;
      });
      return { ...prevFormValues, games: updatedGames };
      });
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
    data.forEach((player, index) => {
      updateFormValues(index, 'playerName', player.name)
    })
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
          onChange={(e) => updateFormValues(index, name, parseInt(e.target.value, 10) || 0)}
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
                    value={formValues.games[index].playerName}
                    onChange={(e) => updateFormValues(index, 'playerName', e.target.value)}
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
                  <InputLabel id={`deck${index}`}>{`${formValues.games[index].playerName}\`s Deck`}</InputLabel>
                  <Select
                    labelId={`deck${index}`}
                    id={`deck${index}`}
                    name="deckNames"
                    value={formValues.games[index].deckName}
                    onChange={(e) => updateFormValues(index, 'deckName', e.target.value)}
                    label={`${formValues.games[index].playerName}\`s Deck`}
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
                <h1>{formValues.games[index].playerName}</h1>

                <RadioGroupField
                  label="Place"
                  name="place"
                  options={[1, 2, 3, 4]}
                  value={formValues.games[index].place}
                  index={index}
                />

                <RadioGroupField
                  label="Order"
                  name="startOrder"
                  options={[1, 2, 3, 4]}
                  value={formValues.games[index].startOrder}
                  index={index}
                />

                <RadioGroupField
                  label="Kills"
                  name="kills"
                  options={[0, 1, 2, 3]}
                  value={formValues.games[index].kills}
                  index={index}
                />

                <RadioGroupField
                  label="Commander Kills"
                  name="commanderKills"
                  options={[0, 1, 2, 3]}
                  value={formValues.games[index].commanderKills}
                  index={index}
                />

                <RadioGroupField
                  label="Bodyguard"
                  name="bodyGuard"
                  options={[0, 1, 2, 3]}
                  value={formValues.games[index].bodyGuard}
                  index={index}
                />

                {/* Infinite Field */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={formValues.games[index].infinite}
                      onChange={(e) => updateFormValues(index, 'infinite', e.target.checked)}
                    />
                  }
                  label={`Infinite Combo`}
                />

                {/* Penalties Field */}
                <TextField
                  label={`Penalties`}
                  type="number"
                  value={formValues.games[index].penalty}
                  onChange={(e) => updateFormValues(index, 'penalty', parseInt(e.target.value, 10) || 0)}
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
