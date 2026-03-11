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
  const [step, setStep] = useState(1) // 1 = photo, 2 = note
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handlePhotoSelect(e) {
    const file = e.target.files[0]
    if (!file) return

    // Compress the image
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

      // Get active connection
      const { data: connection } = await supabase
        .from('connections')
        .select('id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'active')
        .single()

      if (!connection) throw new Error('No active connection found')

      // Upload photo
      const filename = `${connection.id}/${uuidv4()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(filename, photo)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('moments')
        .getPublicUrl(filename)

      // Save moment to database
      const { error: insertError } = await supabase.from('moments').insert({
        connection_id: connection.id,
        author_id: user.id,
        photo_url: publicUrl,
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
    <div className="max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-rose-100">
        <button onClick={() => step === 2 ? setStep(1) : router.back()}
          className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </button>
        <h2 className="font-lora text-xl text-rose-800">New Moment</h2>
      </div>

      <div className="px-4 pt-6">
        {step === 1 && (
          <div className="text-center">
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-rose-200 rounded-2xl p-12 hover:border-rose-400 transition bg-white">
                <p className="text-5xl mb-3">📷</p>
                <p className="text-rose-700 font-medium text-sm">Tap to choose a photo</p>
                <p className="text-gray-400 text-xs mt-1">JPG, PNG or WEBP · Max 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div>
            {preview && (
              <img src={preview} alt="Preview"
                className="w-full rounded-2xl object-cover max-h-72 mb-4" />
            )}

            <div className="bg-white rounded-2xl p-4 border border-rose-100">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value.slice(0, 300))}
                placeholder="Write a note... what are you feeling right now?"
                rows={4}
                className="w-full text-sm text-gray-700 resize-none focus:outline-none font-lora leading-relaxed placeholder-gray-300"
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${note.length > 280 ? 'text-rose-500' : 'text-gray-300'}`}>
                  {note.length} / 300
                </span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={uploading || !note.trim()}
              className="w-full bg-rose-700 text-white rounded-xl py-3 text-sm font-medium hover:bg-rose-800 disabled:opacity-50 transition mt-4"
            >
              {uploading ? 'Sharing...' : 'Share Moment ✨'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}