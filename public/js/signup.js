import {showAlert} from './alerts.js'

export const signup = async (...fields) => {
  try {
    const [name, email, password, passwordConfirm] = fields
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {name, email, password, passwordConfirm}
    })
    if (res.data.status === 'success') {
      showAlert('success', 'Signed up successfully')
      window.setTimeout(() => {
        location.assign('/')
      }, 1000)
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}