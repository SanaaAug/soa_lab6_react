const GATEWAY = 'https://goldfish-app-ue5o7.ondigitalocean.app'

// localStorage-с token авч Authorization header үүсгэнэ
function authHeaders(extra = {}) {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}`, ...extra }
}

// Өөрийн profile авах
export async function getMyProfile() {
  const res = await fetch(`${GATEWAY}/api/users/me`, {
    headers: authHeaders(),
  })
  return res.json()
}

// Шинэ profile үүсгэх
export async function createProfile(data) {
  const res = await fetch(`${GATEWAY}/api/users`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  })
  return res.json()
}

// Profile шинэчлэх (зөвхөн өөрийнхөө)
export async function updateProfile(id, data) {
  const res = await fetch(`${GATEWAY}/api/users/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  })
  return res.json()
}

// Profile устгах (зөвхөн өөрийнхөө)
export async function deleteProfile(id) {
  const res = await fetch(`${GATEWAY}/api/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return res.json()
}

// Зураг user-file-service рүү байршуулна — profile шинэчлэлт болон имэйл мэдэгдэл автоматаар явна
export async function uploadPhoto(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${GATEWAY}/files/upload`, {
    method: 'POST',
    headers: authHeaders(), // Content-Type автоматаар multipart/form-data болно
    body: form,
  })
  return res.json()
}
