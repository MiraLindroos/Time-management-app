import './Card.css'
import cardColors from "../../theme/cardColors"

const Card = ({icon, title, description, children, variant = "default"}) => {

  // Get card background and style from theme based on variant
  const styles = cardColors[variant] || cardColors.default
  return (
    <div className='card' style={styles}>
      <div className='card-info'>
        {/* Show given icon and title */}
        <h3>{icon} {title}</h3>
        {/* Display optional description */}
        <small>{description}</small>
      </div>
      <div className='card-content'>
        {/* Card main content are */}
        {children}
      </div>
    </div>
  )
}

export default Card