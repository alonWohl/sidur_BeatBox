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
            className={`text-white text-xs sm:text-sm font-medium rounded h-full flex items-center justify-center cursor-pointer hover:brightness-90 transition-all ${
              dragSnapshot.isDragging ? 'opacity-75 bg-blue-500' : ''
            }`}
            style={{
              backgroundColor: employee.color,
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
