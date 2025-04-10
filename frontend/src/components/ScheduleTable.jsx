import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { format, startOfWeek, addDays } from 'date-fns'
import { he } from 'date-fns/locale' // Hebrew locale
import React, { useState, useCallback, useEffect } from 'react'
import { AssigneeCell } from './AssigneeCell'
import { toast } from 'react-hot-toast'
import { Check, X, Share2, Trash2, LayoutGrid, Users } from 'lucide-react'
import { Button } from './ui/button'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const SHIFTS = ['morning', 'noon', 'evening']
const SHIFT_NAMES = {
  morning: 'בוקר',
  noon: 'אמצע',
  evening: 'ערב'
}

const BRANCH_ROLES = {
  manager: { name: 'אחמ"ש', positions: 1 },
  waiters: { name: 'מלצרים', positions: 5 },
  cooks: { name: 'טבחים', positions: 6 }
}

// Array of department IDs for easy access
const DEPARTMENTS = Object.keys(BRANCH_ROLES)

export const ScheduleTable = React.memo(
  ({
    type,
    currentSchedule,
    getAssignedEmployee,
    handleRemoveEmployee,
    handleUpdateSchedule,
    employees,
    isSharing,
    onClearSchedule,
    weekMode = 'current',
    setIsSharing
  }) => {
    // We don't use this state anymore since swap functionality was commented out
    // eslint-disable-next-line no-unused-vars
    const [selectedForSwap, setSelectedForSwap] = useState(null)
    const [allCells, setAllCells] = useState([])
    const [highlightedDay, setHighlightedDay] = useState(null)
    const [selectedEmployee, setSelectedEmployee] = useState(null)

    // Reset selectedEmployee when schedule changes - now commented out to keep selection persistent
    // useEffect(() => {
    // 	setSelectedEmployee(null);
    // }, [currentSchedule]);

    useEffect(() => {
      const cells = []
      DAYS.forEach((day) => {
        if (type === 'מוקד') {
          SHIFTS.forEach((shift) => {
            const positions = shift === 'morning' ? 3 : shift === 'noon' ? 1 : 3
            for (let i = 1; i <= positions; i++) {
              cells.push(`${day}-${shift}-${i}`)
            }
          })
        } else {
          Object.entries(BRANCH_ROLES).forEach(([role, config]) => {
            for (let i = 1; i <= config.positions; i++) {
              cells.push(`${day}-${role}-${i}`)
            }
          })
        }
      })
      setAllCells(cells)
    }, [type])

    const getWeekDates = () => {
      const today = new Date()
      let startOfTheWeek = startOfWeek(today, { weekStartsOn: 0 })

      if (weekMode === 'next') {
        startOfTheWeek = addDays(startOfTheWeek, 7)
      }

      return DAYS.map((day, index) => {
        const date = addDays(startOfTheWeek, index)
        return {
          name: day,
          date: format(date, 'd/M', { locale: he })
        }
      })
    }

    const isToday = (dayName) => {
      if (weekMode === 'next') return false

      const today = new Date()
      const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
      return hebrewDays[today.getDay()] === dayName
    }

    const isMoked = type === 'מוקד'
    const POSITIONS_PER_SHIFT = isMoked ? 3 : null

    // Helper function to add an employee to a cell
    const addEmployee = useCallback(
      (day, role, position, employeeId) => {
        handleUpdateSchedule(currentSchedule, employeeId, day, role, parseInt(position))
      },
      [currentSchedule, handleUpdateSchedule]
    )

    const handleCellClick = useCallback(
      (day, role, position, currentEmployee) => {
        if (selectedEmployee) {
          // Check if employee can be assigned to this department
          if (!isMoked && !selectedEmployee.departments?.includes(role)) {
            toast.error(`${selectedEmployee.name} אינו שייך למחלקת ${BRANCH_ROLES[role]?.name || role}`)
            return
          }

          if (currentEmployee) {
            handleRemoveEmployee(currentSchedule, day, role, position)
          }

          addEmployee(day, role, position, selectedEmployee.id)
          toast.success(`נוסף ${selectedEmployee.name} למשמרת`)
          // Employee remains selected for multiple placements
        }
      },
      [selectedEmployee, handleRemoveEmployee, currentSchedule, addEmployee, isMoked]
    )

    const renderCell = useCallback(
      (day, role, position) => {
        const cellId = `${day}-${role}-${position}`
        const employee = getAssignedEmployee(currentSchedule, day, role, position)
        const isSelected = selectedForSwap === cellId
        const isSwappable = selectedForSwap && selectedForSwap !== cellId && getAssignedEmployee(currentSchedule, ...selectedForSwap.split('-'))

        return (
          <AssigneeCell
            key={cellId}
            id={cellId}
            employee={employee}
            employees={employees || []}
            onRemove={() => handleRemoveEmployee(currentSchedule, day, role, position)}
            addEmployee={addEmployee}
            allCells={allCells}
            // onSwap={handleSwap}
            isSelected={isSelected}
            isSwappable={isSwappable}
            highlightedDay={highlightedDay === day}
            selectedEmployee={selectedEmployee}
            onCellClick={() => handleCellClick(day, role, position, employee)}
          />
        )
      },
      [
        currentSchedule,
        getAssignedEmployee,
        handleRemoveEmployee,
        addEmployee,
        allCells,
        // handleSwap,
        employees,
        selectedForSwap,
        highlightedDay,
        selectedEmployee,
        handleCellClick
      ]
    )

    const renderMokedLayout = () => (
      <TableBody>
        {SHIFTS.flatMap((shift) => {
          let shiftPositions = 0
          if (shift === 'morning') shiftPositions = 3
          else if (shift === 'noon') shiftPositions = 2
          else if (shift === 'evening') shiftPositions = 3

          return Array.from({ length: shiftPositions }, (_, index) => {
            const position = index + 1
            return (
              <TableRow key={`${shift}-${position}`} className="transition-colors">
                <TableCell
                  className={`text-center font-medium text-sm transition-all h-7 sm:h-9
                                ${position === 1 ? 'bg-[#BE202E]/10 text-[#BE202E] font-bold drop-shadow-sm' : 'border-t-0 bg-gray-100/50'}`}>
                  {position === 1 ? <div className="py-0.5 sm:py-1 text-xs sm:text-sm">{SHIFT_NAMES[shift]}</div> : ''}
                </TableCell>
                {DAYS.map((day) => (
                  <TableCell
                    key={`${day}-${shift}-${position}`}
                    className={`p-0 w-[60px] sm:w-[80px] border h-7 sm:h-9 ${isToday(day) ? 'bg-blue-50/40' : ''} ${
                      highlightedDay === day ? 'bg-yellow-50' : ''
                    } 
										${position === 1 ? '' : ''} transition-colors`}
                    onMouseEnter={() => setHighlightedDay(day)}
                    onMouseLeave={() => setHighlightedDay(null)}>
                    {renderCell(day, shift, position)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        })}
      </TableBody>
    )

    const renderBranchLayout = () => (
      <TableBody>
        {Object.entries(BRANCH_ROLES).flatMap(([role, config]) =>
          Array.from({ length: config.positions }, (_, index) => {
            const position = index + 1
            return (
              <TableRow key={`${role}-${position}`} className="h-7 sm:h-9 transition-colors hover:bg-gray-50/30">
                <TableCell
                  className={`text-center font-medium border-l border text-xs sm:text-sm transition-all
                      ${position === 1 ? 'bg-[#BE202E]/10 text-[#BE202E] font-bold border-t-2 border-t-[#BE202E]' : 'border-t-0 bg-gray-100/50'}`}>
                  {position === 1 ? <div className="py-0.5 sm:py-1 font-bold text-xs sm:text-sm">{config.name}</div> : ''}
                </TableCell>
                {DAYS.map((day) => (
                  <TableCell
                    key={`${day}-${role}-${position}`}
                    className={`border p-0 transition-colors h-7 sm:h-9 ${isToday(day) ? 'bg-blue-50/40' : ''} ${
                      highlightedDay === day ? 'bg-yellow-50' : ''
                    } 
										${position === 1 ? '' : 'border-t-0'}`}
                    onMouseEnter={() => setHighlightedDay(day)}
                    onMouseLeave={() => setHighlightedDay(null)}>
                    {renderCell(day, role, position)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        )}
      </TableBody>
    )

    // Handle WhatsApp sharing
    const handleShareToWhatsApp = async () => {
      try {
        if (!currentSchedule) {
          toast.error('אין נתונים לשיתוף')
          return
        }

        setIsSharing(true)

        // Create a completely new element for sharing
        // This avoids any inherited styles that might contain problematic color formats
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.top = '-9999px'
        container.style.width = '2000px'
        container.style.background = '#ffffff'
        container.style.padding = '20px'
        container.style.fontFamily = 'Arial, sans-serif'
        container.style.direction = 'rtl'
        container.style.border = '2px solid #cccccc'
        container.style.borderRadius = '8px'

        // Add title
        const title = document.createElement('h1')
        title.textContent = `סידור עבודה שבועי - ${type}`
        title.style.textAlign = 'center'
        title.style.fontSize = '32px' // LARGER title font
        title.style.fontWeight = 'bold'
        title.style.padding = '15px'
        title.style.margin = '0 0 25px 0'
        title.style.backgroundColor = '#BE202E' // Keep the original red
        title.style.color = '#ffffff'
        title.style.borderRadius = '4px'
        title.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)'
        container.appendChild(title)

        // Create table
        const table = document.createElement('table')
        table.style.width = '100%'
        table.style.borderCollapse = 'collapse'
        table.style.border = '2px solid #dddddd'
        table.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'

        // Get the week dates
        const weekDates = getWeekDates()

        // Create header row
        const thead = document.createElement('thead')
        const headerRow = document.createElement('tr')

        // First cell - shifts column
        const shiftHeader = document.createElement('th')
        shiftHeader.textContent = 'משמרת'
        shiftHeader.style.padding = '15px' // More padding
        shiftHeader.style.backgroundColor = '#f0f0f0' // Light gray for header
        shiftHeader.style.color = '#333333' // Dark text
        shiftHeader.style.border = '1px solid #dddddd'
        shiftHeader.style.fontWeight = 'bold'
        shiftHeader.style.fontSize = '20px' // LARGER header font
        shiftHeader.style.width = '80px' // Control width of first column
        shiftHeader.style.maxWidth = '80px' // Enforce maximum width
        headerRow.appendChild(shiftHeader)

        // Day headers
        weekDates.forEach(({ name, date }) => {
          const dayHeader = document.createElement('th')

          const dayName = document.createElement('div')
          dayName.textContent = name
          dayName.style.fontSize = '24px' // LARGER day names font
          dayName.style.fontWeight = 'bold'

          const dayDate = document.createElement('div')
          dayDate.textContent = date
          dayDate.style.fontSize = '18px' // LARGER date font
          dayDate.style.color = 'rgba(0,0,0,0.7)'
          dayDate.style.marginTop = '5px'

          dayHeader.appendChild(dayName)
          dayHeader.appendChild(dayDate)

          dayHeader.style.padding = '15px' // More padding
          dayHeader.style.border = '1px solid #dddddd'
          dayHeader.style.textAlign = 'center'
          dayHeader.style.width = '100px' // Fixed width for day columns

          // Highlight today
          if (isToday(name)) {
            dayHeader.style.backgroundColor = '#fff0f0' // Lighter, more refined red
            dayHeader.style.color = '#BE202E' // Original red color for text
            dayHeader.style.borderTop = '3px solid #BE202E'
          } else {
            dayHeader.style.backgroundColor = '#f0f0f0' // Light gray for header
            dayHeader.style.color = '#333333' // Dark text
          }

          headerRow.appendChild(dayHeader)
        })

        thead.appendChild(headerRow)
        table.appendChild(thead)

        // Create table body
        const tbody = document.createElement('tbody')

        // Define a more refined color palette for employee backgrounds
        const colorPalette = [
          '#4285f4', // Google blue
          '#34a853', // Google green
          '#fbbc05', // Google yellow
          '#ea4335', // Google red
          '#5f6368', // Google grey
          '#4fc3f7', // Light blue
          '#9575cd', // Purple
          '#f06292', // Pink
          '#4db6ac', // Teal
          '#ff7043' // Deep orange
        ]

        // Helper to get a vibrant color for employees
        const getVibrantColor = (originalColor, index) => {
          // If the original color is a simple hex and not too light, use it
          if (
            originalColor &&
            !originalColor.includes('oklch') &&
            !originalColor.includes('oklab') &&
            !originalColor.includes('var(') &&
            !originalColor.includes('hsl')
          ) {
            return originalColor
          }

          // Otherwise use from our vibrant palette
          return colorPalette[index % colorPalette.length]
        }

        // Create rows based on type (מוקד or branch)
        if (type === 'מוקד') {
          // Moked layout
          SHIFTS.forEach((shift) => {
            let positions = 0
            if (shift === 'morning') positions = 3
            else if (shift === 'noon') positions = 1
            else if (shift === 'evening') positions = 3

            for (let position = 1; position <= positions; position++) {
              const row = document.createElement('tr')

              // Shift cell
              const shiftCell = document.createElement('td')
              if (position === 1) {
                // Only show shift name on first position
                shiftCell.textContent = SHIFT_NAMES[shift]
                shiftCell.style.fontWeight = 'bold'
                shiftCell.style.backgroundColor = '#fff0f0' // Light refined red background
                shiftCell.style.color = '#BE202E' // Original red color for text
                shiftCell.style.fontSize = '18px' // LARGER shift font
              } else {
                shiftCell.style.backgroundColor = '#f9f9f9' // Very light gray
              }
              shiftCell.style.padding = '5px 8px' // Less padding
              shiftCell.style.border = '1px solid #dddddd'
              shiftCell.style.textAlign = 'center'
              shiftCell.style.width = '80px' // Fixed narrow width
              shiftCell.style.maxWidth = '80px' // Enforce maximum width
              row.appendChild(shiftCell)

              // Day cells
              DAYS.forEach((day) => {
                const cell = document.createElement('td')
                cell.style.padding = '10px'
                cell.style.border = '1px solid #dddddd'
                cell.style.textAlign = 'center'
                cell.style.height = '75px' // TALLER cells to fit larger text
                cell.style.width = '120px' // WIDER cells to fit larger text
                cell.style.backgroundColor = '#ffffff' // White background

                // Highlight today's column
                if (isToday(day)) {
                  cell.style.backgroundColor = '#fafafa' // Very light gray for today
                }

                // Add employee if exists
                const employee = getAssignedEmployee(currentSchedule, day, shift, position)
                if (employee) {
                  // Make the cell more vibrant and text larger
                  const employeeIndex = employees.findIndex((e) => e.id === employee.id)
                  const vibrantColor = getVibrantColor(employee.color, employeeIndex)

                  // Create a styled container for employee name
                  const nameSpan = document.createElement('div')
                  nameSpan.textContent = employee.name
                  nameSpan.style.fontSize = '32px' // MUCH LARGER employee name font
                  nameSpan.style.fontWeight = 'bold'
                  nameSpan.style.padding = '8px'
                  nameSpan.style.color = '#ffffff'
                  nameSpan.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)' // Subtle text shadow
                  nameSpan.style.width = '100%'
                  nameSpan.style.height = '100%'
                  nameSpan.style.display = 'flex'
                  nameSpan.style.justifyContent = 'center'
                  nameSpan.style.alignItems = 'center'

                  cell.style.backgroundColor = vibrantColor
                  cell.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.3)' // Subtle inner highlight
                  cell.appendChild(nameSpan)
                }

                row.appendChild(cell)
              })

              tbody.appendChild(row)
            }
          })
        } else {
          // Branch layout
          Object.entries(BRANCH_ROLES).forEach(([role, config]) => {
            for (let position = 1; position <= config.positions; position++) {
              const row = document.createElement('tr')

              // Role cell
              const roleCell = document.createElement('td')
              if (position === 1) {
                // Only show role name on first position
                roleCell.textContent = config.name
                roleCell.style.fontWeight = 'bold'
                roleCell.style.backgroundColor = '#fff0f0' // Light refined red background
                roleCell.style.color = '#BE202E' // Original red color for text
                roleCell.style.fontSize = '18px' // LARGER role font
              } else {
                roleCell.style.backgroundColor = '#f9f9f9' // Very light gray
              }
              roleCell.style.padding = '5px 8px' // Less padding
              roleCell.style.border = '1px solid #dddddd'
              roleCell.style.textAlign = 'center'
              roleCell.style.width = '80px' // Fixed narrow width
              roleCell.style.maxWidth = '80px' // Enforce maximum width
              row.appendChild(roleCell)

              // Day cells
              DAYS.forEach((day) => {
                const cell = document.createElement('td')
                cell.style.padding = '10px'
                cell.style.border = '1px solid #dddddd'
                cell.style.textAlign = 'center'
                cell.style.height = '75px' // TALLER cells to fit larger text
                cell.style.width = '120px' // WIDER cells to fit larger text
                cell.style.backgroundColor = '#ffffff' // White background

                // Highlight today's column
                if (isToday(day)) {
                  cell.style.backgroundColor = '#fafafa' // Very light gray for today
                }

                // Add employee if exists
                const employee = getAssignedEmployee(currentSchedule, day, role, position)
                if (employee) {
                  // Make the cell more vibrant and text larger
                  const employeeIndex = employees.findIndex((e) => e.id === employee.id)
                  const vibrantColor = getVibrantColor(employee.color, employeeIndex)

                  // Create a styled container for employee name
                  const nameSpan = document.createElement('div')
                  nameSpan.textContent = employee.name
                  nameSpan.style.fontSize = '32px' // MUCH LARGER employee name font
                  nameSpan.style.fontWeight = 'bold'
                  nameSpan.style.padding = '8px'
                  nameSpan.style.color = '#ffffff'
                  nameSpan.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)' // Subtle text shadow
                  nameSpan.style.width = '100%'
                  nameSpan.style.height = '100%'
                  nameSpan.style.display = 'flex'
                  nameSpan.style.justifyContent = 'center'
                  nameSpan.style.alignItems = 'center'

                  cell.style.backgroundColor = vibrantColor
                  cell.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.3)' // Subtle inner highlight
                  cell.appendChild(nameSpan)
                }

                row.appendChild(cell)
              })

              tbody.appendChild(row)
            }
          })
        }

        table.appendChild(tbody)
        container.appendChild(table)

        // Add to document body temporarily
        document.body.appendChild(container)

        // Capture with html2canvas
        const html2canvasModule = await import('html2canvas')
        const html2canvas = html2canvasModule.default

        const canvas = await html2canvas(container, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
          width: container.scrollWidth,
          height: container.scrollHeight
        })

        // Remove the temporary container
        document.body.removeChild(container)

        // Convert to image
        const dataUrl = canvas.toDataURL('image/png', 1.0)

        // Create sharing data
        const message = `סידור עבודה שבועי - ${type}`
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `schedule-${type}.png`, { type: 'image/png' })

        // Share or download
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: message,
            text: message
          })
        } else {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

          if (isMobile) {
            // Create a temporary download link
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `schedule-${type}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Open WhatsApp with text prompt
            setTimeout(() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
            }, 500)
          } else {
            // Desktop fallback - just download the image
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `schedule-${type}.png`
            link.click()
          }
        }

        toast.dismiss()
        toast.success('התמונה נוצרה בהצלחה')
      } catch (error) {
        console.error('Share error:', error)
        toast.error('שגיאה בשיתוף')
      } finally {
        setIsSharing(false)
      }
    }

    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Employee selection with departments */}
        <div className="px-2 sm:px-4 xl:px-6 2xl:px-0 bg-gray-50 rounded-lg px-4 border border-gray-200 mb-2 sm:mb-4 w-full flex-shrink-0">
          <div className="flex items-center gap-2 py-2 sm:py-3">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
            <div className="text-xs sm:text-sm font-medium text-gray-700">עובדים:</div>
          </div>

          {/* Show departments only for branches, not for Moked */}
          {isMoked ? (
            // Original employee selection for Moked
            <div
              className="pb-2 sm:pb-3 grid grid-cols-6 sm:grid-cols-7 gap-0.5 max-w-76 md:max-w-full w-full -mt-1 overflow-x-auto whitespace-nowrap"
              style={{ scrollbarWidth: 'none' }}>
              {employees?.map((emp) => (
                <button
                  key={emp.id}
                  className={`inline-flex px-1 sm:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] sm:text-xs w-full transition-all justify-center items-center gap-0.5 sm:gap-1 text-white truncate
                ${selectedEmployee?.id === emp.id ? 'ring-2 ring-white shadow-sm' : 'hover:shadow-sm'}`}
                  style={{ backgroundColor: emp.color }}
                  onClick={() => {
                    if (selectedEmployee?.id === emp.id) {
                      setSelectedEmployee(null)
                    } else {
                      setSelectedEmployee(emp)
                    }
                  }}>
                  {selectedEmployee?.id === emp.id && <Check className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0 text-white" />}
                  <span className="truncate">{emp.name}</span>
                </button>
              ))}
            </div>
          ) : (
            // Department-based employee selection for branches
            <div className="pb-2 sm:pb-4 space-y-2 sm:space-y-3">
              {/* Group employees by department */}
              {DEPARTMENTS.map((departmentId) => {
                // Get employees for this department
                const departmentEmployees = employees?.filter((emp) => emp.departments?.includes(departmentId))

                if (!departmentEmployees?.length) return null

                return (
                  <div key={departmentId} className="space-y-1">
                    {/* Department header */}
                    <div className="text-xs font-medium px-1 text-gray-600 flex items-center gap-1">
                      {BRANCH_ROLES[departmentId]?.name || departmentId}
                      <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">{departmentEmployees.length}</span>
                    </div>

                    {/* Department employees */}
                    <div className="grid grid-cols-5 md:grid-cols-7 gap-0.5 max-w-76 md:max-w-full w-full overflow-x-auto whitespace-nowrap">
                      {departmentEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          className={`inline-flex px-2 py-1 rounded-sm md:text-sm text-xs w-full transition-all justify-center items-center gap-1 text-white truncate
														${selectedEmployee?.id === emp.id ? 'ring-2 ring-white shadow-sm' : 'hover:shadow-sm'}`}
                          style={{ backgroundColor: emp.color }}
                          onClick={() => {
                            if (selectedEmployee?.id === emp.id) {
                              setSelectedEmployee(null)
                            } else {
                              setSelectedEmployee(emp)
                            }
                          }}>
                          {selectedEmployee?.id === emp.id && <Check className="h-3 w-3 flex-shrink-0 text-white" />}
                          <span className="truncate">{emp.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Table container with horizontal scroll */}
        <div className="px-2 sm:px-4 xl:px-6 2xl:px-0 bg-white py-2 sm:py-3 border-b border-gray-200 flex flex-wrap md:flex-nowrap justify-between items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-[#BE202E]/10 flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 text-[#BE202E]" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">לוח {type}</h3>
          </div>

          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            {selectedEmployee && (
              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                <span className="text-xs text-gray-600 ml-1">בחירת תא עבור</span>
                <span className="text-xs font-medium mx-1" style={{ color: selectedEmployee.color }}>
                  {selectedEmployee.name}
                </span>
                <button
                  className="h-5 w-5 rounded-full bg-white flex items-center justify-center hover:bg-gray-100"
                  onClick={() => setSelectedEmployee(null)}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex gap-2 ml-auto">
              <Button onClick={handleShareToWhatsApp} disabled={isSharing} className="bg-green-600 hover:bg-green-700 h-8 px-3 rounded-md" size="sm">
                {isSharing ? (
                  <span className="animate-spin text-white">⏳</span>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-white" />
                    <span className="whitespace-nowrap text-white text-xs mr-1.5">שתף</span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => onClearSchedule && onClearSchedule(currentSchedule)}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 h-8 px-3 rounded-md"
                variant="outline"
                size="sm">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span className="whitespace-nowrap text-red-600 text-xs mr-1.5">נקה</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table with vertical scroll */}
        <div className="px-2 sm:px-4 xl:px-6 2xl:px-0 flex-grow overflow-hidden min-h-0">
          <div
            className="h-full overflow-y-auto overflow-x-auto scrollbar-thin max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-260px)] md:max-h-none"
            style={{ WebkitOverflowScrolling: 'touch' }}>
            <Table className="w-full table-fixed h-full pb-8">
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-center font-medium bg-gray-100 text-zinc-900 border-b-2 border-b-gray-200 py-2 sm:py-3 text-xs sm:text-sm sticky left-0 z-20">
                    משמרת
                  </TableHead>
                  {getWeekDates().map(({ name, date }) => (
                    <TableHead
                      key={name}
                      className={`text-center font-medium text-xs sm:text-sm whitespace-nowrap p-1 sm:p-2 border-x transition-colors
                          ${highlightedDay === name ? 'bg-yellow-50' : ''}
                          ${
                            isToday(name)
                              ? 'bg-[#BE202E]/5 text-[#BE202E] font-bold border-t-2 border-t-[#BE202E] border-b-0'
                              : 'font-medium bg-gray-50 border-b-2 border-b-gray-200'
                          }`}
                      onMouseEnter={() => setHighlightedDay(name)}
                      onMouseLeave={() => setHighlightedDay(null)}>
                      <div className="text-center font-bold text-[11px] sm:text-base mb-0.5 sm:mb-1">{name}</div>
                      <div className={`text-[10px] sm:text-sm ${isToday(name) ? 'text-[#BE202E]/80 font-medium' : 'text-gray-500'}`}>{date}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {isMoked ? renderMokedLayout() : renderBranchLayout()}
            </Table>
          </div>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    const shouldUpdate =
      prevProps.type !== nextProps.type ||
      prevProps.currentSchedule !== nextProps.currentSchedule ||
      JSON.stringify(prevProps.currentSchedule?.days) !== JSON.stringify(nextProps.currentSchedule?.days) ||
      prevProps.employees !== nextProps.employees

    return !shouldUpdate
  }
)
