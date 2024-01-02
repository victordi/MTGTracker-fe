import { createTheme, ThemeOptions} from "@mui/material";

export const customTheme: ThemeOptions = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: 'rgba(21,36,119,0.95)',
            main: 'rgba(21,36,119,0.95)',
            dark: 'rgba(21,36,119,0.95)',
        },
        background: {
            paper: 'rgb(31,31,33)',
            default: 'rgb(31,31,33)'
        }
    },
      components: {
        MuiCssBaseline: {
          styleOverrides: () => `
            div {
                width: 100%;
            }
          `,
        },
        MuiTab: {
          styleOverrides: {
            root: {
              "&.Mui-selected": {
                color: "inherit",
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            select: {
              color: "inherit",
            },
          },
        },
      },
})
