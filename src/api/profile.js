const GATEWAY = 'https://goldfish-app-ue5o7.ondigitalocean.app'

// localStorage-с token авч Authorization header үүсгэнэ
function authHeaders(extra = {}) {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}`, ...extra }
}

// 401 ирвэл тусгай алдаа шиднэ — дуудагч нь token хүчингүй болсныг мэдэж гарах боломжтой болно
async function apiFetch(url, options) {
  const res = await fetch(url, options)
  if (res.status === 401) {
    const err = new Error('UNAUTHORIZED')
    err.status = 401
    throw err
  }
  return res.json()
}

// Өөрийн profile авах
export async function getMyProfile() {
  return apiFetch(`${GATEWAY}/api/users/me`, {
    headers: authHeaders(),
  })
}

// Шинэ profile үүсгэх
export async function createProfile(data) {
  return apiFetch(`${GATEWAY}/api/users`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  })
}

// Profile шинэчлэх (зөвхөн өөрийнхөө)
export async function updateProfile(id, data) {
  return apiFetch(`${GATEWAY}/api/users/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  })
}

// Profile устгах (зөвхөн өөрийнхөө)
export async function deleteProfile(id) {
  return apiFetch(`${GATEWAY}/api/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

// Зураг user-file-service рүү байршуулна — profile шинэчлэлт болон имэйл мэдэгдэл автоматаар явна
export async function uploadPhoto(file) {
  const form = new FormData()
  form.append('file', file)
  return apiFetch(`${GATEWAY}/files/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })
}
