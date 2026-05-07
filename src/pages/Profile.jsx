import { useState, useEffect, useCallback } from 'react'
import { getMyProfile, createProfile, updateProfile, deleteProfile, uploadPhoto } from '../api/profile'

const EMPTY_FORM = { name: '', email: '', bio: '', phone: '', address: '' }

function ProfileForm({ form, set, saving, editing, setEditing, onSubmit, submitLabel }) {
  return (
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
        {editing && (
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(false)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const set = useCallback((field) => (e) => {
    const value = e.target.value
    setForm(f => ({ ...f, [field]: value }))
  }, [])

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

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
        setProfile(null)
        setForm(EMPTY_FORM)
      }
    } catch (err) {
      if (err.status === 401) { onLogout(); return }
      flash('error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => { fetchProfile() }, [fetchProfile])

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
    } catch (err) {
      if (err.status === 401) { onLogout(); return }
      flash('error', 'Server error')
    } finally {
      setSaving(false)
    }
  }

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
    } catch (err) {
      if (err.status === 401) { onLogout(); return }
      flash('error', 'Server error')
    } finally {
      setSaving(false)
    }
  }

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
    } catch (err) {
      if (err.status === 401) { onLogout(); return }
      flash('error', 'Server error')
    }
  }

  const handleUpload = async () => {
    if (!photoFile) return
    setUploading(true)
    try {
      const res = await uploadPhoto(photoFile)
      if (res.success) {
        flash('success', 'Photo uploaded!')
        setPhotoFile(null)
        await fetchProfile()
      } else {
        flash('error', res.message || 'Upload failed')
      }
    } catch (err) {
      if (err.status === 401) { onLogout(); return }
      flash('error', 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-full">
      <nav className="navbar">
        <h1>User Portal</h1>
        <button className="btn-logout" onClick={onLogout}>Sign out</button>
      </nav>

      <div className="profile-content">
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {loading ? (
          <div className="section" style={{ textAlign: 'center', color: '#888' }}>Loading…</div>
        ) : !profile ? (
          <div className="section">
            <h3 className="section-title">Create your profile</h3>
            <ProfileForm
              form={form}
              set={set}
              saving={saving}
              editing={false}
              setEditing={setEditing}
              onSubmit={handleCreate}
              submitLabel="Create profile"
            />
          </div>
        ) : !editing ? (
          <>
            <div className="section">
              <h3 className="section-title">My Profile</h3>

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
              {photoFile && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>{photoFile.name}</p>}
            </div>
          </>
        ) : (
          <div className="section">
            <h3 className="section-title">Edit Profile</h3>
            <ProfileForm
              form={form}
              set={set}
              saving={saving}
              editing={editing}
              setEditing={setEditing}
              onSubmit={handleUpdate}
              submitLabel="Save changes"
            />
          </div>
        )}
      </div>
    </div>
  )
}
