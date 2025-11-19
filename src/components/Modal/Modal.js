import './Modal.css'
import Button from '../Button/Button'

const Modal = ({message, children, onConfirm, onCancel, cancelButton, confirmButton, width = "65%"}) => {
  return (
    <div className="modal">
      <div className="modal-content" style={{width}}>
        {/* Display modal message */}
        <p>{message}</p>
        {/* Modal content */}
        {children}
        {/* Modal buttons for cancel and confirm */}
        <div className="modal-buttons">
          <Button title={cancelButton} onClick={onCancel}/>
          <Button title={confirmButton} onClick={onConfirm} />
        </div>
      </div>
    </div>
  )
}

export default Modal