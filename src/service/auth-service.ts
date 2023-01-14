import axios from "axios";
import {API_URL, AT_STORAGE} from "../constants";

class AuthService {
    login(username: string, password: string) {
        return axios
            .post(API_URL + "login",
                {
                    "username": username,
                    "password": password
                }, {
                    withCredentials: false
                })
            .then(response => {
                if (response.status == 200) {
                    const expiryDate = new Date().setHours(new Date().getHours() + 1)
                    const payload = {expiryDate, at: 'Bearer ' + response.data.data}
                    localStorage.setItem(AT_STORAGE, JSON.stringify(payload))
                    return true
                }
            })
            .catch(reason => {
                console.log(reason)
                return false
            })
    }

    loggedUserAT(): string|null {
        const stored = localStorage.getItem(AT_STORAGE)
        if (stored == null) return null
        else {
            const obj = JSON.parse(stored)
            const time = new Date().getTime()
            if (time > obj.expiryDate) {
                localStorage.removeItem(AT_STORAGE)
                return null
            }
            return obj.at
        }
    }
}

export default new AuthService()