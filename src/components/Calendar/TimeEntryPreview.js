const TimeEntryPreview = ({ date, timeEntryDates, onEntryClick }) => {
  return (
    <div className="time-entry">
      {/* Map through all time entries for this day and display them */}
      {timeEntryDates.map((entry, index) => {
        // Calculate the entry's full hours and minutes
        const fullHours = Math.floor(entry.hours)
        const fullMinutes = Math.round((entry.hours - fullHours) * 60)
        return (
          <p
            key={index}
            onClick={(e) => {
              // Prevent parent event from triggering (DayCell.js onClick)
              e.stopPropagation()
              onEntryClick(date, entry)
            }}>
            {/* Display project name and calculated hours */}
            {entry.project} - {fullHours}h {fullMinutes}min
          </p>
        )
      }
      )}
    </div>

  )
}

export default TimeEntryPreview