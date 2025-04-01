import { useDroppable, useDraggable } from '@dnd-kit/core'

export function DroppableCell({ id, employee, onRemove }) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id,
    data: {
      type: 'cell',
      cellId: id
    }
  })

  const {
    attributes,
    listeners: dndListeners,
    setNodeRef: setDraggableRef,
    isDragging
  } = useDraggable({
    id: `draggable-${id}`,
    data: {
      type: 'tableCell',
      cellId: id,
      employee
    },
    disabled: !employee
  })

  const listeners = {
    ...dndListeners,
    onMouseDown: (e) => {
      let dragStarted = false
      const timeout = setTimeout(() => {
        dragStarted = true
        dndListeners.onMouseDown(e)
      }, 150) // 200ms delay before drag starts

      const handleMouseUp = () => {
        if (!dragStarted) {
          // If we release before the delay, treat it as a click
          onRemove(id)
        }
        clearTimeout(timeout)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mouseup', handleMouseUp)
    }
  }

  const ref = (node) => {
    setDroppableRef(node)
    if (employee) {
      setDraggableRef(node)
    }
  }

  return (
    <div
      ref={ref}
      {...attributes}
      {...listeners}
      className={`h-8 w-full border border-gray-200 relative
              flex items-center justify-center text-white truncate px-1
              ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
              ${employee ? 'cursor-pointer group hover:delay-150' : ''}`}
      style={{
        backgroundColor: employee?.color || 'transparent',
        opacity: isDragging ? 0 : 1
      }}>
      <div
        className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 
              transition-opacity duration-200 delay-150"
      />
      {!isDragging && (
        <span
          className="relative z-10 group-hover:hidden 
                transition-opacity duration-200 delay-150">
          {employee?.name}
        </span>
      )}
      {!isDragging && employee && (
        <span
          className="relative z-10 hidden group-hover:block text-sm
                transition-opacity duration-200 delay-150">
          לחץ להסרה
        </span>
      )}
    </div>
  )
}
