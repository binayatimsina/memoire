export default function MomentCard({ moment, currentUserId }) {
  const isOwn = moment.author_id === currentUserId
  const date = new Date(moment.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-rose-50">
      <img
        src={moment.photo_url}
        alt="Moment"
        className="w-full object-cover max-h-80"
      />
      <div className="p-4">
        <p className="font-lora text-gray-800 text-base leading-relaxed mb-3">
          {moment.note}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-xs text-rose-700 font-medium">
              {moment.author?.display_name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">
              {isOwn ? 'You' : moment.author?.display_name}
            </span>
          </div>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  )
}