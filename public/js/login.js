// import axios from 'axios'
import { showAlert } from './alerts.js'

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: { email, password }
        })
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully')
            window.setTimeout(() => {
                location.assign('/')
            }, 1000)
        }
    } catch (err) { showAlert('error', err.response.data.message) }
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout'
        })
        if (res.data.status === 'success') {
            showAlert('success', 'You\'ve logged out successfully')
            window.setTimeout(() => {
                location.reload(true)
            }, 1000)
        }
    } catch (err) { showAlert('error', 'Error logging out! Try again.') }
}


