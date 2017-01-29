import React, {Component, PropTypes} from 'react'
import {Modal} from 'react-bootstrap'
import Button from 'components/Button'
import {Color} from 'constants/css'

const maxChar = 150
export default class BioEditModal extends Component {
  static propTypes = {
    onHide: PropTypes.func,
    onSubmit: PropTypes.func,
    firstLine: PropTypes.string,
    secondLine: PropTypes.string,
    thirdLine: PropTypes.string
  }

  constructor(props) {
    super()
    this.state = {
      firstLine: props.firstLine,
      secondLine: props.secondLine,
      thirdLine: props.thirdLine
    }
  }
  render() {
    const {onHide, onSubmit} = this.props
    const {firstLine, secondLine, thirdLine} = this.state
    return (
      <Modal
        show
        onHide={onHide}
        animation={false}
      >
        <Modal.Header closeButton>
          <h4>Edit Your Bio</h4>
        </Modal.Header>
        <Modal.Body>
          <form className="container-fluid">
            <fieldset className="form-group">
              <label><strong>Answer <b style={{color: Color.blue}}>one or multiple</b> questions below, or write anything you want about yourself</strong></label>
              <div style={{display: 'inline'}}>
                <input
                  autoFocus
                  value={firstLine}
                  onChange={event => this.setState({firstLine: event.target.value})}
                  className="form-control"
                  placeholder="Write something"
                  type="text"
                />
              </div>
              <small>If you are a Twinkle student, which class are you in Twinkle? If you are a non-Twinkle student which english academy do you go to? (For example, LexKim) What is the name of your teacher? If you are not a student, what is your occupation? If you don't want to answer these questions, feel free to introduce yourself anyway you want </small><br/>
              <b style={{color: firstLine.length > maxChar && 'red'}}>{`(${firstLine.length}/${maxChar} characters)`}</b>
            </fieldset>
            <fieldset className="form-group">
              <label><strong>Answer <b style={{color: Color.blue}}>one or multiple</b> questions below, or write anything you want about yourself</strong></label>
              <div style={{display: 'inline'}}>
                <input
                  value={secondLine}
                  onChange={event => this.setState({secondLine: event.target.value})}
                  className="form-control"
                  placeholder="Write something"
                  type="text"
                />
              </div>
              <small>What is your favorite activity? What do you love doing? If you like books, what are some of your favorite books? If you like video games, what's your favorite video game title? What do you normally do when you play with your friends? Or, feel free to write anything you want (ideally about something you love doing)</small><br/>
              <b style={{color: secondLine.length > maxChar && 'red'}}>{`(${secondLine.length}/${maxChar} characters)`}</b>
            </fieldset>
            <fieldset className="form-group">
              <label><strong>Answer <b style={{color: Color.blue}}>one or multiple</b> questions below, or write anything you want about yourself</strong></label>
              <div style={{display: 'inline'}}>
                <input
                  value={thirdLine}
                  onChange={event => this.setState({thirdLine: event.target.value})}
                  className="form-control"
                  placeholder="Write something"
                  type="text"
                />
              </div>
              <small>What's the name of your school? (Example: Daechi elementary school) What grade are you in? If you've finished school, which was the last school you attended? What is your favorite school subject? Or, write anything you wish your friends knew about yourself</small><br/>
              <b style={{color: thirdLine.length > maxChar && 'red'}}>{`(${thirdLine.length}/${maxChar} characters)`}</b>
            </fieldset>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-default" onClick={onHide}>Cancel</Button>
          <Button
            className="btn btn-primary"
            onClick={() => onSubmit({firstLine, secondLine, thirdLine})}
            type="submit"
            disabled={firstLine.length > maxChar || secondLine.length > maxChar || thirdLine.length > maxChar}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
