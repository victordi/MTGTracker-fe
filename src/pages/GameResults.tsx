import React, {ReactElement, useEffect, useState} from 'react';
import '../App.css'
import {useParams} from "react-router-dom";
import axios from "axios";
import {API_URL, refreshLogin} from "../constants";
import AuthService from "../service/auth-service";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";

interface Game {
    id: number,
    playerName: string,
    deckName: string,
    place: number,
    startOrder: number,
    kills: number,
    commanderKills: number,
    infinite: boolean,
    bodyGuard: number,
    penalty: number,
    delete: null
}

interface Column {
    id: 'id' | 'playerName' | 'deckName' | 'place' | 'startOrder' | `kills` |
        `commanderKills` | `infinite` | `bodyGuard` | `penalty` | `delete`;
    label: string;
    minWidth?: number;
    align?: 'right';
}

const columns: readonly Column[] = [
    { id: 'id', label: 'GameId', minWidth: 10 },
    { id: 'playerName', label: 'PlayerName', minWidth: 80 },
    { id: 'deckName', label: 'DeckName', minWidth: 80 },
    { id: 'place', label: 'Place', minWidth: 10 },
    { id: 'startOrder', label: 'StartOrder', minWidth: 10 },
    { id: 'kills', label: 'Kills', minWidth: 10 },
    { id: 'commanderKills', label: 'CommanderKills', minWidth: 10 },
    { id: 'infinite', label: 'InfiniteCombo', minWidth: 10 },
    { id: 'bodyGuard', label: 'Bodyguard', minWidth: 10 },
    { id: 'penalty', label: 'Penalty', minWidth: 10 },
    { id: 'delete', label: 'Delete', minWidth: 80 }
];

export default function GameResults(): ReactElement {
    const {id} = useParams()

    useEffect(() => {
        fetchGames().then();
    }, []);

    const [games, setGames] = useState<Game[]>([]);
    const [page, setPage] = React.useState(0);
    const rowsPerPage = 10

    const fetchGames = async () => {
        const data: Game[] = await axios.get(
            API_URL + `seasons/${id}/results`,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then((result) => result.data.data)
            .catch((reason) => {if (reason.response.status == 401) refreshLogin()})
        console.log(data)
        setGames(data)
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const deleteGameResult = async (gameId: number) => {
        const failed: boolean = await axios.delete(
            API_URL + `seasons/${id}/results/${gameId}`,
            {
                headers: {
                    Authorization: AuthService.loggedUserAT()
                }
            }
        )
            .then(() => false)
            .catch((reason) => {
                if (reason.response.status == 401) refreshLogin()
                return true
            })
        if (failed) alert("Failed to delete game.")
        else window.location.reload()
    }

    return (
        <div>
            <br/>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 840 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead className="tableHead">
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {games
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((game) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={game.id}>
                                            {columns.map((column) => {
                                                const value = game[column.id];
                                                if (column.id === "delete") return (
                                                    <Button
                                                        key={game.id}
                                                        variant="contained"
                                                        color="primary"
                                                        type="submit"
                                                        onClick={() => deleteGameResult(game.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                )
                                                else
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {typeof value === 'boolean' ? `${value}` : value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={games.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[rowsPerPage]}
                />
            </Paper>
        </div>
    )
}
