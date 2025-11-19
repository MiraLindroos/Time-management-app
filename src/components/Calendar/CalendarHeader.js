import { useAtomValue } from "jotai"
import { currentDateAtom } from "../../jotai/atoms"

const CalendarHeader = ({nextMonth, previousMonth}) => {
  const currentDate = useAtomValue(currentDateAtom)
  // Returns the current month's name as a <p> element
  const getMonth = () => {
    return <p>{currentDate.toLocaleString('default', {month: 'long'})}</p>
  }
  // Handler for going to the previous month
  const clickLeft = () => {
    previousMonth()
  }
  // Handler for going to the next month
  const clickRight = () => {
    nextMonth()
  }

  const weekdays = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']

  return (
    <>
      <div className="calendar-header">
        {/* Button to go to the previous month */}
        <button className="header-button" onClick={clickLeft}>{'<<'}</button>
        {/* Current month's name */}
        {getMonth()}
        {/* Button to go to the next month */}
        <button className="header-button" onClick={clickRight}>{'>>'}</button>
      </div>
      {/* Weekday labels row */}
      <div className="calendar-weekdays">
        {weekdays.map(day => (
          <span className="calendar-weekday" key={day}>{day}</span>
        ))}
      </div>
    </>
  )
}

export default CalendarHeader