import {showAlert} from './alerts.js'

export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? 'https://natoours.herokuapp.com/api/v1/users/updateMyPassword' : 'https://natoours.herokuapp.com/api/v1/users/updateMe'
    const res = await axios({
      method: 'PATCH',
      url,
      data
    })
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`)
      return true
    }

  } catch (err) {
    showAlert('error', err.response.data.message)
    return false
  }
}