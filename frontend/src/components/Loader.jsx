import { Loader2 } from 'lucide-react'

export function Loader() {
  return (
    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="text-gray-600 font-medium">מעדכן...</span>
      </div>
    </div>
  )
}
