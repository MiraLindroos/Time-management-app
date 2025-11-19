import Calendar from "../../components/Calendar/Calendar"
import "./TimeManagement.css"
import useDateUtils from "../../hooks/useDateUtils"
import useModal from "../../hooks/useModal"
import Modal from "../../components/Modal/Modal"
import Form from "../../components/Forms/Form"
import useAddHoursForm from "../../hooks/useAddHoursForm"
import { useForm, FormProvider } from "react-hook-form"
import useCalendarTimeEntries from "../../hooks/useCalendarTimeEntries"
import { Toaster } from "react-hot-toast"
import Button from "../../components/Button/Button"
import useTravels from "../../hooks/useTravels"
import useTimeEntryActions from "../../hooks/useTimeEntryActions"

const TimeManagement = () => {
  const {
    currentMonth,
    currentYear,
    daysInAMonth,
    nextMonth,
    previousMonth,
  } = useDateUtils()

  const {
    showModal,
    modalContent,
    openModal,
    closeModal,
  } = useModal()

  const { addHoursFields } = useAddHoursForm()

  const { deleteTimeEntry } = useCalendarTimeEntries(currentMonth, currentYear)

  const { deleteTravelByEntry } = useTravels()

  const { onSubmit } = useTimeEntryActions()

  const methods = useForm()

  const handleDayClick = (date) => {
    const formattedDate = date.toLocaleDateString('fi-FI', { weekday: 'short', day: 'numeric', month: 'numeric' })
    methods.reset({  // Reset methods before adding a new entry
      startTime: "",
      endTime: "",
      project: "",
      travel: "",
      hourRate: "",
      memo: ""
    })
    openModal({
      message: `Lisää tunteja päivälle ${formattedDate}`,
      children:
      <FormProvider {...methods}>
        <Form fields={addHoursFields} />
      </FormProvider>,
      onConfirm: methods.handleSubmit((data) => {
        onSubmit(data, date)
        closeModal()
      }),
      onCancel: closeModal,
      cancelButton: "Peruuta",
      confirmButton: "Tallenna",
      width: "85%"
    })
  }

  const onDelete = (entry) => {
    openModal({
      message: `Haluatko varmasti poistaa tuntilisäyksen projektille ${entry.project}?`,
      onConfirm: () => {
        // Delete the time entry
        deleteTimeEntry(entry)
        // Delete the travel document linked to the entry
        deleteTravelByEntry(entry)
        closeModal()
      },
      onCancel: closeModal,
      cancelButton: "Peruuta",
      confirmButton: "Vahvista",
      width: "85%"
    })
  }

  const handleEntryClick = (date, entry) => {
    // Find the project field from the form addHoursFields array
    const projectField = addHoursFields.find(f => f.name === "project")
    // Find the project option by matching the name to the entry.project
    // This is needed because the select form expects a JSON string of the whole project object as its value
    const selectedProject = projectField.options.find(option => option.name === entry.project)

    const formattedDate = date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' })

    methods.reset({ // Reset methods with entry values
      ...entry,
      startTime: entry.startTime.toDate().toTimeString().slice(0, 5),
      endTime: entry.endTime.toDate().toTimeString().slice(0, 5),
      project: JSON.stringify(selectedProject),
    })
    openModal({
      message: `Muokkaa tunteja päivälle ${formattedDate} (Projekti: ${entry.project})`,
      children:
      <>
        <Button title={'Poista'} onClick={() => onDelete(entry)} />
        <FormProvider {...methods}>
          <Form fields={addHoursFields} />
        </FormProvider>
      </>,
      onConfirm: methods.handleSubmit((data) => {
        onSubmit(data, date, entry)
        closeModal()
      }),
      onCancel: closeModal,
      cancelButton: "Peruuta",
      confirmButton: "Tallenna",
      width: "85%"
    })
  }

  return (
    <>
      <h3>Ajanhallinta</h3>
      <div className="timemanagement">
        <Calendar
          daysInAMonth={daysInAMonth}
          nextMonth={nextMonth}
          previousMonth={previousMonth}
          onDateClick={handleDayClick}
          onEntryClick={handleEntryClick}
        />
        {showModal &&
          <Modal
            message={modalContent.message}
            children={modalContent.children}
            onConfirm={modalContent.onConfirm}
            onCancel={modalContent.onCancel}
            cancelButton={modalContent.cancelButton}
            confirmButton={modalContent.confirmButton}
            width={modalContent.width}
          />
        }
      </div>
      <Toaster />
    </>
  )
}

export default TimeManagement