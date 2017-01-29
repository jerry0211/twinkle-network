import React, {PropTypes} from 'react'
import {Modal} from 'react-bootstrap'
import Button from 'components/Button'

UserListModal.propTypes = {
  users: PropTypes.array,
  userId: PropTypes.number,
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  descriptionColor: PropTypes.string,
  style: PropTypes.object,
  onHide: PropTypes.func,
  title: PropTypes.string
}
export default function UserListModal(props) {
  const {users, userId, description = '', descriptionColor} = props
  const otherUsers = users.filter(user => user.userId !== userId)
  let userArray = []
  for (let i = 0; i < users.length; i++) {
    if (users[i].userId === userId) userArray.push(users[i])
  }
  return (
    <Modal
      show
      style={props.style}
      onHide={props.onHide}
      animation={false}
      bsSize="sm"
    >
      <Modal.Header closeButton>
        <h5>{props.title}</h5>
      </Modal.Header>
      <Modal.Body>
        <ul
          className="list-group"
          style={{marginBottom: '0px'}}
        >
        {userArray.concat(otherUsers).map(
          user => {
            return (
              <li
                className="list-group-item"
                key={user.userId}
              >{user.username} <span style={{color: descriptionColor && descriptionColor}}>{description && description(user)}</span>
              </li>
            )
          })
        }
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn btn-default"
          onClick={() => props.onHide()}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
