import axios from "axios";

interface NotificationOpts {
  appToken?: string
  userToken?: string
}

export async function sendNotification(message: string, opts: NotificationOpts = {}) {
  return await axios.post('https://api.pushover.net/1/messages.json', {
    token: opts.appToken,
    user: opts.userToken,
    message
  })
}