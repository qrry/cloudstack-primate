import { axios } from '@/utils/request'

export function api (command, args = {}, method = 'GET', data = {}) {
  let params = {}
  args.command = command
  args.response = 'json'

  if (data) {
    params = new URLSearchParams()
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, value)
    })
  }

  return axios({
    params: {
      ...args
    },
    url: '/',
    method,
    data: params || {}
  })
}

export function login (arg) {
  const params = new URLSearchParams()
  params.append('command', 'login')
  params.append('username', arg.username)
  params.append('password', arg.password)
  params.append('domain', arg.domain)
  params.append('response', 'json')
  return axios({
    url: '/',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export function logout () {
  return api('logout')
}
