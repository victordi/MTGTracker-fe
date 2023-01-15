import { createTheme, ThemeOptions} from "@mui/material";

export const customTheme: ThemeOptions = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: 'rgba(21,36,119,0.65)',
            main: 'rgba(21,36,119,0.65)',
            dark: 'rgba(21,36,119,0.65)',
        },
        background: {
            paper: '#2d2d1f',
            default: 'rgb(31,31,33)'
        }
    }
})