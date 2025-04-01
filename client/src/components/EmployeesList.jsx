import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function DraggableEmployee({ employee }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: employee.id,
    data: {
      type: 'employee',
      employee
    }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-2 sm:p-3 rounded cursor-grab active:cursor-grabbing 
        text-sm sm:text-base w-20 sm:w-24 text-center touch-manipulation 
        select-none text-white transition-all duration-200 hover:brightness-90
        truncate"
      style={{
        backgroundColor: employee.color,
        opacity: isDragging ? 0 : 1,
        WebkitTapHighlightColor: 'transparent'
      }}>
      {!isDragging && employee.name}
    </div>
  )
}

export function EmployeesList({ employees }) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full items-center justify-center">
      {employees.map((employee) => (
        <DraggableEmployee key={employee.id} employee={employee} />
      ))}
    </div>
  )
}
