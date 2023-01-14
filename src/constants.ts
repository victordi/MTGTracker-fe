export const API_URL = "http://localhost:8086/" as const;
export const AT_STORAGE = "AT_HEADER" as const;

export const navStyle = {
    color: 'red',
    textDecoration: 'none'
} as const;

export const refreshLogin = () => {
    console.log("Failed auth -> cleaning localStorage")
    localStorage.removeItem(AT_STORAGE)
    window.location.reload()
}