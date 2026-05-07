import { useState, useEffect, useCallback } from 'react'
import { getMyProfile, createProfile, updateProfile, deleteProfile, uploadPhoto } from '../api/profile'

const EMPTY_FORM = { name: '', email: '', bio: '', phone: '', address: '' }

// Profile удирдах хуудас — харах, үүсгэх, засах, устгах, зураг оруулах
export default function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(false)
  const [msg, setMsg] = useState(null)        // { type: 'success'|'error', text }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  // Мэдэгдэл 3.5 секундын дараа автоматаар арилна
  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

  // Серверээс profile татаж авна
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyProfile()
      if (res.success) {
        setProfile(res.data)
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          bio: res.data.bio || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        })
      } else {
        // Profile байхгүй тохиолдолд үүсгэх маягт харуулна
        setProfile(null)
        setForm(EMPTY_FORM)
      }
    } catch {
      flash('error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  // Хуудас ачаалахад profile татна
  useEffect(() => { fetchProfile() }, [fetchProfile])

  // Шинэ profile үүсгэх
  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await createProfile(form)
      if (res.success) {
        flash('success', 'Profile created!')
        setProfile(res.data)
        setEditing(false)
      } else {
        flash('error', res.message || 'Failed to create profile')
      }
    } catch {
      flash('error', 'Server error')
    } finally {
      setSaving(false)
    }
  }

  // Одоо байгаа profile-ийг шинэчлэх
  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateProfile(profile.id, form)
      if (res.success) {
        flash('success', 'Profile updated!')
        setProfile(res.data)
        setEditing(false)
      } else {
        flash('error', res.message || 'Failed to update')
      }
    } catch {
      flash('error', 'Server error')
    } finally {
      setSaving(false)
    }
  }

  // Profile устгах (баталгаажуулалтын харилцах цонхтой)
  const handleDelete = async () => {
    if (!confirm('Delete your profile? This cannot be undone.')) return
    try {
      const res = await deleteProfile(profile.id)
      if (res.success) {
        setProfile(null)
        setForm(EMPTY_FORM)
        flash('success', 'Profile deleted')
      } else {
        flash('error', res.message || 'Failed to delete')
      }
    } catch {
      flash('error', 'Server error')
    }
  }

  // Зураг S3-д байршуулах
  const handleUpload = async () => {
    if (!photoFile) return
    setUploading(true)
    try {
      const res = await uploadPhoto(photoFile)
      if (res.success) {
        flash('success', 'Photo uploaded!')
        setPhotoFile(null)
        // Шинэ зургийн URL-г profile-д тусгахын тулд дахин татна
        await fetchProfile()
      } else {
        flash('error', res.message || 'Upload failed')
      }
    } catch {
      flash('error', 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Profile үүсгэх болон засах хоёуланд ашиглах маягт
  const ProfileForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={form.name} onChange={set('name')} placeholder="Full name" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" value={form.phone} onChange={set('phone')} placeholder="+1 234 567 890" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" value={form.address} onChange={set('address')} placeholder="City, Country" />
        </div>
      </div>
      <div className="form-group">
        <label>Bio</label>
        <textarea value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself…" />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {/* Засах горимд Cancel товч харуулна */}
        {editing && (
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )

  return (
    <div className="page-full">
      {/* Навигаци хэсэг */}
      <nav className="navbar">
        <h1>User Portal</h1>
        <button className="btn-logout" onClick={onLogout}>Sign out</button>
      </nav>

      <div className="profile-content">
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {loading ? (
          <div className="section" style={{ textAlign: 'center', color: '#888' }}>Loading…</div>
        ) : !profile ? (
          /* Profile байхгүй тохиолдолд үүсгэх маягт */
          <div className="section">
            <h3 className="section-title">Create your profile</h3>
            <ProfileForm onSubmit={handleCreate} submitLabel="Create profile" />
          </div>
        ) : !editing ? (
          /* Profile харах горим */
          <>
            <div className="section">
              <h3 className="section-title">My Profile</h3>

              {/* Зураг байвал харуулна, байхгүй бол emoji placeholder */}
              {profile.photoUrl
                ? <img src={profile.photoUrl} alt="Profile" className="profile-photo" />
                : <div className="photo-placeholder">👤</div>
              }

              {[
                ['Name', profile.name],
                ['Email', profile.email],
                ['Phone', profile.phone],
                ['Address', profile.address],
                ['Bio', profile.bio],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div className="profile-field" key={label}>
                  <strong>{label}:</strong> <span>{value}</span>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete profile</button>
              </div>
            </div>

            {/* Зураг байршуулах хэсэг */}
            <div className="section">
              <h3 className="section-title">Profile Photo</h3>
              <div className="file-input-wrapper">
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleUpload}
                  disabled={!photoFile || uploading}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Profile засах горим */
          <div className="section">
            <h3 className="section-title">Edit Profile</h3>
            <ProfileForm onSubmit={handleUpdate} submitLabel="Save changes" />
          </div>
        )}
      </div>
    </div>
  )
}
