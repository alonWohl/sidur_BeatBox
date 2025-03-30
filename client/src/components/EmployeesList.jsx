import { Droppable, Draggable } from '@hello-pangea/dnd'

export function EmployeesList({ employees }) {
  return (
    <Droppable droppableId="employees-list" direction="horizontal">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-1.5 sm:gap-2 text-white w-full">
          {employees.map((employee, index) => (
            <Draggable key={employee.id} draggableId={employee.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`p-1.5 sm:p-2 rounded cursor-pointer text-sm sm:text-base w-16 sm:w-20 text-center ${
                    snapshot.isDragging ? 'shadow-xl' : ''
                  }`}
                  style={{
                    backgroundColor: employee.color,
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
}
