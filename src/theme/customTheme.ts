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
            paper: 'rgb(31,31,33)',
            default: 'rgb(31,31,33)'
        }
    },
      components: {
        MuiCssBaseline: {
          styleOverrides: (themeParam) => `
            div {
                width: 100%;
            }
          `,
        },
      },
})