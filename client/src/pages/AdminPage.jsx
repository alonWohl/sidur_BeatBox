import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

import { useState } from 'react'
import { SchedulePage } from './SchedulePage'

export function AdminPage() {
  const [filterBy, setFilterBy] = useState({})

  const handleBranchChange = (value) => {
    setFilterBy({ ...filterBy, branch: value })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="mt-10 items-center gap-4">
        <Select onValueChange={handleBranchChange} value={filterBy.branch}>
          <SelectTrigger>
            <SelectValue placeholder="בחר סניף" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="moked">מוקד</SelectItem>
            <SelectItem value="tlv">תל אביב</SelectItem>
            <SelectItem value="pt">פתח תקווה</SelectItem>
            <SelectItem value="rishon">רשאון לציון</SelectItem>
            <SelectItem value="rosh">ראש העין</SelectItem>
          </SelectContent>
        </Select>
        {filterBy && <SchedulePage filterBy={filterBy} />}
      </div>
    </div>
  )
}
