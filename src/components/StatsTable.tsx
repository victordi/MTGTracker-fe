import React, {ReactElement} from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow} from "@mui/material";

export type Stats = {
    gamesPlayed: number,
    gamesWon: number,
    gamesWonWhenFirst: number,
    gamesWonWhenSecond: number,
    gamesWonWhenThird: number,
    gamesWonWhenFourth: number,
    gamesWonWithInfinite: number,
    avgPlace: number,
    avgKills: number,
    avgCommanderKills: number
}
export const EMPTY_STATS: Stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesWonWhenFirst: 0,
    gamesWonWhenSecond: 0,
    gamesWonWhenThird: 0,
    gamesWonWhenFourth: 0,
    gamesWonWithInfinite: 0,
    avgPlace: 0,
    avgKills: 0,
    avgCommanderKills: 0
} as const;
export type DeckStats = { deckName: string, stats: Stats }
export type SeasonStats = { first: string, second: { avgStats: Stats, deckStats: DeckStats[] } }[]
export type StatsRow = {
    name: string,
    gamesPlayed: number,
    gamesWon: number,
    gamesWonWhenFirst: number,
    gamesWonWhenSecond: number,
    gamesWonWhenThird: number,
    gamesWonWhenFourth: number,
    gamesWonWithInfinite: number,
    avgPlace: number,
    avgKills: number,
    avgCommanderKills: number
}

export const toStatsRow = (stats: Stats, title: string): StatsRow => {
    return {
        name: title,
        gamesPlayed: stats.gamesPlayed,
        gamesWon: stats.gamesWon,
        gamesWonWhenFirst: stats.gamesWonWhenFirst,
        gamesWonWhenSecond: stats.gamesWonWhenSecond,
        gamesWonWhenThird: stats.gamesWonWhenThird,
        gamesWonWhenFourth: stats.gamesWonWhenFourth,
        gamesWonWithInfinite: stats.gamesWonWithInfinite,
        avgPlace: stats.avgPlace,
        avgKills: stats.avgKills,
        avgCommanderKills: stats.avgCommanderKills
    }
}

interface Column {
    id: 'name' | 'gamesPlayed' | 'gamesWon' | 'gamesWonWhenFirst' | 'gamesWonWhenSecond' | 'gamesWonWhenThird' |
        `gamesWonWhenFourth` | `gamesWonWithInfinite` | `avgPlace` | `avgKills` | `avgCommanderKills`;
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    {id: 'name', label: 'Name', minWidth: 180},
    {id: 'gamesPlayed', label: 'Games Played'},
    {id: 'gamesWon', label: 'Games Won'},
    {id: 'gamesWonWhenFirst', label: 'When first'},
    {id: 'gamesWonWhenSecond', label: 'When second'},
    {id: 'gamesWonWhenThird', label: 'When Third'},
    {id: 'gamesWonWhenFourth', label: 'When Fourth'},
    {id: 'gamesWonWithInfinite', label: 'When Infinite'},
    {id: 'avgPlace', label: 'avg. Place', format: (value: number) => value.toFixed(3)},
    {id: 'avgKills', label: 'avg. Kills', format: (value: number) => value.toFixed(3)},
    {id: 'avgCommanderKills', label: 'avg. CKills', format: (value: number) => value.toFixed(3)}
];

export default function StatsTable(stats: StatsRow[]): ReactElement {
    const [page, setPage] = React.useState(0);
    const rowsPerPage = 10

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    return (
        <div id="bottom-div">
            <br/>
            <Paper sx={{width: '100%', overflow: 'hidden'}}>
                <TableContainer sx={{maxHeight: 840}}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead className="tableHead">
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{minWidth: column.minWidth}}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((stat) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={stat.name}>
                                            {columns.map((column) => {
                                                const value = stat[column.id];
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {
                                                            column.format && typeof value === 'number'
                                                                ? column.format(value)
                                                                : value
                                                        }
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
                    count={stats.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[rowsPerPage]}
                />
            </Paper>
        </div>
    )
}