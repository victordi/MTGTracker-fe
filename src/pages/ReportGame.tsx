import React, {FormEvent, ReactElement, useEffect, useState} from "react";
import axios from "axios";
import {API_URL, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Box, Tab, Tabs, ToggleButtonGroup, ToggleButton, TableRow, TableCell, TableBody, Table
} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";

interface Player {
  name: string;
  decks: object[];
}

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
}

interface FormValues {
  games: GameData[]
}

interface ResultRowProps {
  label: string;
  name: keyof GameData;
  options: number[];
  value: number;
  index: number;
}

type DeckTier = "I" | "II" | "III" | "Any";

export default function ReportGame(): ReactElement {
  const {id} = useParams();

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

  const [players, setPlayers] = useState<string[]>([]);
  const [decks, setDecks] = useState<string[][]>([[], [], [], []]);
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [selectedTier, setSelectedTier] = useState<DeckTier>("Any");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchPlayers().then();
  }, []);

  const navigation = useNavigate();

  const handleNext = async () => {
    if (currentStep == 1) {
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
    }
    setCurrentStep(currentStep + 1)
  };

  const handleBack = async () => {
    if (currentStep != 0) setCurrentStep(currentStep - 1)
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

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
              {headers: {Authorization: AuthService.loggedUserAT()}})
              .catch((reason) => {
                if (reason.response.status === 401) refreshLogin()
              });
            console.log(`Deleted ${gameId}`);
          })
        return;
      }
    }
    navigation(`/seasons/${id}`);
  };

  const updateFormValues = (idx: number, label: keyof GameData, value: number | string | boolean) => {
    setFormValues(prevFormValues => {
      const updatedGames = prevFormValues.games.map((game, index) => {
        if (index === idx) {
          return {...game, [label]: value};
        }
        return game;
      });
      return {...prevFormValues, games: updatedGames};
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
      .catch((reason) => {
        if (reason.response.status === 401) refreshLogin()
      });

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
      .catch((reason) => {
        if (reason.response.status === 401) refreshLogin()
      });

    return data
      .filter((deck) => {
        if (selectedTier == "Any") return true
        else return deck.tier == selectedTier
      })
      .map((deck) => deck.name);
  };

  const NavigationButtons = (): ReactElement => {
    return (
      <Box sx={{display: "flex", justifyContent: "space-evenly", gap: "33%"}}>
        {currentStep != 0 &&
            <Button variant="contained" color="primary" onClick={handleBack}>
                Back
            </Button>
        }
        {currentStep != 3 &&
            <Button variant="contained" color="primary" onClick={handleNext}>
                Next
            </Button>
        }
        {currentStep == 3 &&
            <Button variant="contained" color="primary" type="submit">
                Report Game
            </Button>
        }
      </Box>
    );
  };

  const ResultEntryRow = ({label, name, options, value, index}: ResultRowProps) => (
    <TableRow>
      <TableCell sx={{width: "50%", fontWeight: "bold"}}>
        <FormLabel sx={{fontSize: "1.4rem", fontWeight: "bold"}}>{label}</FormLabel>
      </TableCell>
      <TableCell sx={{width: "50%", textAlign: "right", pl: "20%"}}>
        <ToggleButtonGroup
          value={value}
          exclusive
          onChange={(_, newValue) => newValue !== null && updateFormValues(index, name, newValue)}
        >
          {options.map((option) => (
            <ToggleButton
              key={option}
              value={option}
              sx={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                padding: "8px 16px",
                border: "3px solid black",
                borderRadius: "20px",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "#fff",
                  border: "2px solid primary.dark",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "primary.dark",
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                },
              }}
            >
              {option}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </TableCell>
    </TableRow>
  );

  return (
    <form onSubmit={handleSubmit} style={{
      padding: 15,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <Stepper activeStep={currentStep} sx={{mb: 3}}>
        {["Select Players", "Select Tier", "Select Decks", "Enter Result"]
          .map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
      </Stepper>
      {currentStep === 0 && (
        <Stack spacing={2} sx={{alignItems: "center", width: "50%"}}>
          {[0, 1, 2, 3].map((index) => (
            <FormControl key={index}>
              <InputLabel sx={{fontWeight: "bold", fontSize: "2rem", color: "#000000"}}
                          id={`player${index + 1}`}>{`Player ${index + 1}`}</InputLabel>
              <Select
                labelId={`player${index + 1}`}
                id={`player${index + 1}`}
                name="playerNames"
                value={formValues.games[index].playerName}
                onChange={(e) => updateFormValues(index, 'playerName', e.target.value)}
                label={`Player ${index + 1}`}
                sx={{fontSize: "3rem"}}
              >
                {players.map((player) => (
                  <MenuItem key={player} value={player}>{player}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          <NavigationButtons/>
        </Stack>
      )}

      {currentStep === 1 && (
        <Stack spacing={2} sx={{alignItems: "center", width: "50%"}}>
          <ToggleButtonGroup
            orientation="vertical"
            value={selectedTier}
            exclusive
            onChange={(_, newTier) => newTier && setSelectedTier(newTier)}
            sx={{
              "& .Mui-selected": {
                fontWeight: "bold",
                fontSize: "1.6rem",
                color: "#000000",
              },
            }}
          >
            {["I", "II", "III", "Any"].map(tier => (
              <ToggleButton
                key={tier}
                value={tier}
                sx={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                padding: "8px 16px",
                border: "1.5px solid black",
                borderRadius: "20px",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "#fff",
                  border: "2px solid primary.dark",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "primary.dark",
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                },
              }}>
                {tier}
              </ToggleButton>
            ))}

            <br/>

            <NavigationButtons/>
          </ToggleButtonGroup>
        </Stack>
      )}

      {currentStep === 2 && (
        <Stack spacing={2} sx={{alignItems: "center", width: "50%"}}>
          {[0, 1, 2, 3].map((index) => (
            <FormControl key={index}>
              <InputLabel sx={{fontWeight: "bold", fontSize: "2rem", color: "#000000"}}
                          id={`deck${index}`}>{`${formValues.games[index].playerName}\`s Deck`}</InputLabel>
              <Select
                labelId={`deck${index}`}
                id={`deck${index}`}
                name="deckNames"
                value={formValues.games[index].deckName}
                onChange={(e) => updateFormValues(index, 'deckName', e.target.value)}
                label={`${formValues.games[index].playerName}\`s Deck`}
                sx={{fontSize: "3rem", height: "100%"}}
              >
                {decks[index].map((deck) => (
                  <MenuItem key={deck} value={deck}>{deck}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          <NavigationButtons/>
        </Stack>
      )}

      {currentStep === 3 && (
        <>
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            centered
            sx={{
              "& .MuiTabs-indicator": {backgroundColor: "#85d245"},
              "& .MuiTab-root": {minWidth: "25%", fontSize: "1.5rem", fontWeight: "bold"}
            }}
          >
            {formValues.games.map((game, index) => (
              <Tab key={index} label={game.playerName || `Player ${index + 1}`}/>
            ))}
          </Tabs>

          <Table sx={{width: "85%", maxWidth: "800px", alignItems: "center"}}>
            <TableBody>
              <ResultEntryRow label="Order" name="startOrder" options={[1, 2, 3, 4]}
                              value={formValues.games[selectedTab].startOrder} index={selectedTab}/>
              <ResultEntryRow label="Place" name="place" options={[1, 2, 3, 4]}
                              value={formValues.games[selectedTab].place} index={selectedTab}/>
              <ResultEntryRow label="Kills" name="kills" options={[0, 1, 2, 3]}
                              value={formValues.games[selectedTab].kills} index={selectedTab}/>
              <ResultEntryRow label="Commander Kills" name="commanderKills" options={[0, 1, 2, 3]}
                              value={formValues.games[selectedTab].commanderKills} index={selectedTab}/>
              <ResultEntryRow label="Penalty" name="penalty" options={[0, 1, 2, 3]}
                              value={formValues.games[selectedTab].penalty} index={selectedTab}/>
              <TableRow>
                <TableCell sx={{width: "50%", fontWeight: "bold"}}>
                  <FormLabel sx={{fontSize: "1.3rem", fontWeight: "bold"}}>Infinite Combo</FormLabel>
                </TableCell>
                <TableCell sx={{width: "50%", textAlign: "right", pl: "30%"}}>
                  <Switch
                    checked={formValues.games[selectedTab].infinite}
                    onChange={(e) => updateFormValues(selectedTab, 'infinite', e.target.checked)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <NavigationButtons/>
        </>
      )}
    </form>
  );
}
