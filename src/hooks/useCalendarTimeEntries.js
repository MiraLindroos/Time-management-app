import { collection, where, Timestamp, query, setDoc, doc, deleteDoc, onSnapshot, updateDoc, increment} from "firebase/firestore"
import { db } from "../firebase/index"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { useAtomValue, useSetAtom } from 'jotai'
import { currentUserAtom, timeEntriesAtom } from '../jotai/atoms'

const useCalendarTimeEntries = (currentMonth, currentYear) => {
  const currentUser = useAtomValue(currentUserAtom)
  const setTimeEntries = useSetAtom(timeEntriesAtom)

  useEffect(() => {
    // Initialize an empty unsubscribe function to be safely called later
    // This prevents "unsubscribe is not a function" errors if for some reason onSnapshot fails or doesn't run
    let unsubscribe = () => {}
    // Fetching time entries from firestore and listen for real-time updates
    const fetchTimeEntries = () => {
      try {
        // Converting dates to timestamps
        const startOfTheMonth = Timestamp.fromDate(new Date(currentYear, currentMonth, 1))
        const endDate = new Date(currentYear, currentMonth + 1, 0)
        // We have to set the hours at 23:59, otherwise the entries for the months last day won't show
        endDate.setHours(23, 59, 59, 999)
        const endOfTheMonth = Timestamp.fromDate(endDate)

        // Fetch all entries from current user that are in the current month
        const q = query(
          collection(db, 'timeEntries'),
          where('userId', '==', currentUser),
          where('startTime', '>=', startOfTheMonth),
          where('startTime', '<=', endOfTheMonth)
        )
        // Start listening to real-time updates from Firestore
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const timeEntriesArray = []
          // Go through each document and push its data to the timeEntriesArray
          querySnapshot.forEach((doc) => {
            // doc.data() returs the document data as an object
            timeEntriesArray.push({id: doc.id, ...doc.data()})
          })
          // Update the state with the fetched time entries
          setTimeEntries(timeEntriesArray)
        })
      } catch (e) {
        console.error(e)
      }
    }
    fetchTimeEntries()
    // Cleanup function runs when the component is unmounted or when a depency changes (e.g. month or year)
    return () => {
    // Stop listening to real-time Firestore updates to prevent memory leaks and duplicate listeners
      unsubscribe()
    }
  }, [currentMonth, currentYear])

  // Update an existing document or add a new one to firestore collection 'timeEntries' with the following data
  const saveTimeEntry = async (data) => {
    try {
      const docRef = data.id ? doc(db, 'timeEntries', data.id) // If id, edit the existing doc
        : doc(collection(db, 'timeEntries')) // Create new doc if no id

      await toast.promise(
        setDoc(docRef, {
        startTime: data.startTime,
        endTime: data.endTime,
        project: data.project,
        projectId: data.projectId,
        kilometers: data.kilometers,
        travelRate: data.travelRate,
        hours: data.hours,
        memo: data.memo,
        userId: currentUser
        }),
        // Toasts for telling the user if it was a success or not
        {
          loading: 'Tallennetaan tunteja..',
          success: 'Tuntien tallentaminen onnistui!',
          error: 'Tuntien tallentaminen epäonnistui'
        }
      )
      return docRef.id
    } catch (e) {
      console.error(e)
    }
  }

  // Increment the selected project's hours when a time entry is added OR
  // entry's project is changed OR entry's hours or kilometers change
  const incrementHoursKm = async (id, hours, km) => {
    try {
      const projectRef = doc(db, 'projects', id)
      await updateDoc(projectRef, {
        hours: increment(Number(hours) || 0),
        kilometers: increment(Number(km) || 0)
      })
    } catch (e) {
      console.error(e)
    }
  }

  // Decrement the old selected project's hours and kilometers when time entry's selectedProject is modified
  const decrementHoursKm = async (id, hours, km) => {
    try {
      const oldProjectRef = doc(db, 'projects', id)
      await updateDoc(oldProjectRef, {
        hours: increment(-(Number(hours)) || 0),
        kilometers: increment(-(Number(km)) || 0)
      })
    } catch (e) {
      console.error(e)
    }
  }

  // Delete a time entry from Firestore
  const deleteTimeEntry = async (entry) => {
    try {
      await toast.promise(
        deleteDoc(doc(db, 'timeEntries', entry.id)),
        {
          loading: 'Poistetaan tunteja..',
          success: 'Tuntien poisto onnistui!',
          error: 'Tuntien poistaminen epäonnistui'
        }
      )
      // Decrement the selected project's hours and kilometers when a time entry is deleted
      if (entry.projectId) {
        decrementHoursKm(entry.projectId, entry.hours, entry.kilometers)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return {
    saveTimeEntry,
    deleteTimeEntry,
    incrementHoursKm,
    decrementHoursKm
  }
}

export default useCalendarTimeEntries