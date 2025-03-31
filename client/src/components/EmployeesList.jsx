import { memo } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'

const EmployeesList = memo(
  function EmployeesList({ employees }) {
    return (
      <Droppable droppableId="employees-list" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-wrap gap-1.5 sm:gap-2 text-white w-full items-center justify-center">
            {employees.map((employee, index) => (
              <Draggable key={employee.id} draggableId={employee.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-1.5 sm:p-2 rounded cursor-pointer text-sm sm:text-base 
                      w-16 sm:w-20 text-center touch-manipulation select-none
                      ${snapshot.isDragging ? 'shadow-xl scale-105' : ''}
                      transition-transform duration-200 hover:brightness-90`}
                    style={{
                      backgroundColor: employee.color,
                      WebkitTapHighlightColor: 'transparent',
                      ...provided.draggableProps.style
                    }}>
                    {employee.name}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if employees array has changed
    if (prevProps.employees.length !== nextProps.employees.length) {
      return false
    }

    return prevProps.employees.every((employee, index) => {
      const nextEmployee = nextProps.employees[index]
      return employee.id === nextEmployee.id && employee.name === nextEmployee.name && employee.color === nextEmployee.color
    })
  }
)

export { EmployeesList }
