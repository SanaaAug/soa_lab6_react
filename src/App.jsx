import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

// Апп-ийн үндсэн component — хуудас шилжилтийг удирдана
export default function App() {
  // Token байвал шууд profile хуудас харуулна
  const [page, setPage] = useState(() => localStorage.getItem('token') ? 'profile' : 'login')

  const goTo = (p) => setPage(p)

  // Гарах үед token устгаж login хуудас руу шилжинэ
  const handleLogout = () => {
    localStorage.removeItem('token')
    goTo('login')
  }

  if (page === 'register') return <Register onLogin={() => goTo('login')} />
  if (page === 'profile') return <Profile onLogout={handleLogout} />
  return <Login onLogin={() => goTo('profile')} onRegister={() => goTo('register')} />
}
