'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { v4 as uuidv4 } from 'uuid'

export default function NewMomentPage() {
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [note, setNote] = useState('')
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handlePhotoSelect(e) {
    const file = e.target.files[0]
    if (!file) return

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    })

    setPhoto(compressed)
    setPreview(URL.createObjectURL(compressed))
    setStep(2)
  }

  async function handleSubmit() {
    if (!photo || !note.trim()) return
    setUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: connection } = await supabase
        .from('connections')
        .select('id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'active')
        .single()

      if (!connection) throw new Error('No active connection found')

      const filename = `${connection.id}/${uuidv4()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(filename, photo, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('moments')
        .getPublicUrl(filename)

      const { error: insertError } = await supabase.from('moments').insert({
        connection_id: connection.id,
        author_id: user.id,
        photo_url: urlData.publicUrl,
        note: note.trim(),
      })

      if (insertError) throw insertError

      router.push('/home')
    } catch (err) {
      setError(err.message)
      setUploading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nm-root {
          min-height: 100vh;
          background: #0f0707;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(180,60,60,0.14) 0%, transparent 60%),
            #0f0707;
          pointer-events: none;
        }

        .nm-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15,7,7,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 20px;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.4);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          padding: 7px 13px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .back-btn:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7);
        }

        .nm-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: rgba(255,255,255,0.9);
        }

        .nm-body {
          position: relative;
          z-index: 1;
          max-width: 520px;
          margin: 0 auto;
          padding: 32px 20px 60px;
        }

        /* STEP INDICATORS */
        .steps {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.3s;
        }

        .step-dot.active {
          background: #e8826a;
          width: 24px;
          border-radius: 4px;
        }

        .step-dot.done {
          background: rgba(232,130,106,0.4);
        }

        /* UPLOAD ZONE */
        .upload-zone {
          border: 1px dashed rgba(232,130,106,0.3);
          border-radius: 20px;
          background: rgba(232,130,106,0.04);
          cursor: pointer;
          transition: all 0.25s;
          overflow: hidden;
          display: block;
          width: 100%;
          text-decoration: none;
        }

        .upload-zone:hover {
          border-color: rgba(232,130,106,0.6);
          background: rgba(232,130,106,0.07);
        }

        .upload-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          gap: 12px;
        }

        .upload-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(232,130,106,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 4px;
          transition: transform 0.2s;
        }

        .upload-zone:hover .upload-icon {
          transform: scale(1.08);
        }

        .upload-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          color: rgba(255,255,255,0.8);
        }

        .upload-sub {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.05em;
        }

        .upload-options {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .upload-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
        }

        /* STEP 2 — NOTE */
        .preview-wrap {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .preview-img {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          display: block;
        }

        .preview-change {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          color: rgba(255,255,255,0.7);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preview-change:hover {
          background: rgba(0,0,0,0.75);
          color: #fff;
        }

        .note-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 8px;
          transition: border-color 0.2s;
        }

        .note-box:focus-within {
          border-color: rgba(232,130,106,0.4);
        }

        .note-label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
          display: block;
        }

        .note-textarea {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1rem;
          color: rgba(255,255,255,0.85);
          resize: none;
          line-height: 1.7;
          placeholder-color: rgba(255,255,255,0.2);
        }

        .note-textarea::placeholder {
          color: rgba(255,255,255,0.2);
          font-style: italic;
        }

        .note-footer {
          display: flex;
          justify-content: flex-end;
          padding: 0 2px;
          margin-bottom: 24px;
        }

        .char-count {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          transition: color 0.2s;
        }

        .char-count.warn { color: #e8826a; }

        .error-box {
          background: rgba(220,60,60,0.12);
          border: 1px solid rgba(220,60,60,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.82rem;
          color: #f08080;
          margin-bottom: 16px;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #c0503a 0%, #e8826a 100%);
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: opacity 0.2s, transform 0.15s;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>

      <div className="nm-root">
        <div className="bg-layer" />

        <header className="nm-header">
          <button
            className="back-btn"
            onClick={() => step === 2 ? setStep(1) : router.back()}
          >
            ← Back
          </button>
          <h2 className="nm-title">New Moment</h2>
        </header>

        <div className="nm-body">
          <div className="steps">
            <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>

          {step === 1 && (
            <label className="upload-zone">
              <div className="upload-inner">
                <div className="upload-icon">📷</div>
                <p className="upload-title">Choose a photo</p>
                <p className="upload-sub">JPG · PNG · WEBP · Max 5MB</p>
                <div className="upload-options">
                  <span className="upload-chip">📁 From library</span>
                  <span className="upload-chip">📸 Take photo</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {step === 2 && (
            <div>
              <div className="preview-wrap">
                <img src={preview} alt="Preview" className="preview-img" />
                <button
                  className="preview-change"
                  onClick={() => { setStep(1); setPhoto(null); setPreview(null) }}
                >
                  Change photo
                </button>
              </div>

              <div className="note-box">
                <span className="note-label">Write a note</span>
                <textarea
                  className="note-textarea"
                  value={note}
                  onChange={e => setNote(e.target.value.slice(0, 300))}
                  placeholder="What's on your mind right now?"
                  rows={4}
                />
              </div>

              <div className="note-footer">
                <span className={`char-count ${note.length > 270 ? 'warn' : ''}`}>
                  {note.length} / 300
                </span>
              </div>

              {error && <div className="error-box">{error}</div>}

              <button
                onClick={handleSubmit}
                disabled={uploading || !note.trim()}
                className="submit-btn"
              >
                {uploading ? 'Sharing...' : 'Share Moment ✦'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}