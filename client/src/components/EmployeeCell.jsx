import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function EmployeeCell({ employee, dragProvided, dragSnapshot, onClick, showTooltip = true, tooltipText = 'לחץ להסרה' }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            onClick={onClick}
            className={`text-white text-sm font-medium h-full flex items-center justify-center 
              cursor-grab active:cursor-grabbing
              touch-manipulation
              select-none
              ${dragSnapshot.isDragging ? 'opacity-75 bg-blue-500 shadow-lg scale-105' : ''}`}
            style={{
              backgroundColor: employee.color,
              transform: dragSnapshot.isDragging
                ? `${dragProvided.draggableProps.style.transform} scale(1.05)`
                : dragProvided.draggableProps.style.transform,
              transition: dragSnapshot.isDragging ? 'none' : 'transform 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'none',
              ...dragProvided.draggableProps.style
            }}>
            {employee.name}
          </div>
        </TooltipTrigger>
        {showTooltip && (
          <TooltipContent dir="rtl" className="text-xs sm:text-sm" sideOffset={5}>
            <p>{tooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
