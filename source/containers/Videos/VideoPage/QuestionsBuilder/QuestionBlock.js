import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ChoiceListItem from './ChoiceListItem'
import EditChoiceListItem from './EditChoiceListItem'
import Textarea from 'components/Texts/Textarea'
import Button from 'components/Button'
import { cleanString, processedString } from 'helpers/stringHelpers'

export default class QuestionBlock extends Component {
  static propTypes = {
    choices: PropTypes.array.isRequired,
    deleted: PropTypes.bool.isRequired,
    inputType: PropTypes.string.isRequired,
    onEdit: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditDone: PropTypes.func.isRequired,
    onEditStart: PropTypes.func.isRequired,
    onRearrange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onSelectChoice: PropTypes.func.isRequired,
    onUndoRemove: PropTypes.func.isRequired,
    questionIndex: PropTypes.number.isRequired,
    title: PropTypes.string
  }

  state = {
    editedChoiceTitles: [],
    editedQuestionTitle: '',
    choiceIndices: []
  }

  componentWillMount() {
    const { title, choices } = this.props
    this.setState({
      editedChoiceTitles: choices.map(choice => choice.label),
      editedQuestionTitle: title,
      choiceIndices: choices.map(choice => choice.id)
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.choices !== nextProps.choices) {
      this.setState({
        editedQuestionTitle: nextProps.title,
        choiceIndices: nextProps.choices.map(choice => choice.id),
        editedChoiceTitles: nextProps.choices.map(choice => choice.label)
      })
    }
  }

  render() {
    const {
      editedChoiceTitles,
      editedQuestionTitle,
      choiceIndices
    } = this.state
    const {
      inputType,
      onSelectChoice,
      questionIndex,
      onEdit,
      deleted,
      title,
      choices
    } = this.props
    const choicePlaceHolder = [
      'Choice A',
      'Choice B',
      'Choice C (Optional)',
      'Choice D (Optional)',
      'Choice E (Optional)'
    ]
    return (
      <div>
        <div>
          {!onEdit ? (
            <h4
              style={{
                opacity: deleted && '0.2',
                paddingLeft: '0px',
                color: !title && '#999'
              }}
            >
              <span
                dangerouslySetInnerHTML={{ __html: title || 'Question Title' }}
              />
            </h4>
          ) : (
            <form
              onSubmit={event => event.preventDefault()}
              style={{
                marginBottom: '1em'
              }}
            >
              <Textarea
                type="text"
                placeholder="Enter Question..."
                value={cleanString(editedQuestionTitle)}
                onChange={event =>
                  this.setState({ editedQuestionTitle: event.target.value })
                }
              />
            </form>
          )}
          {!onEdit &&
            !deleted && (
              <Button danger onClick={() => this.props.onRemove(questionIndex)}>
                Remove
              </Button>
            )}
          {deleted && (
            <Button
              transparent
              onClick={() => this.props.onUndoRemove(questionIndex)}
            >
              Undo
            </Button>
          )}
        </div>
        <div style={{ opacity: deleted && '0.2' }}>
          {choiceIndices.map(
            (choiceIndex, index) =>
              !onEdit ? (
                <ChoiceListItem
                  key={index}
                  placeholder={choicePlaceHolder[index]}
                  questionIndex={questionIndex}
                  id={choiceIndex}
                  onSelect={() => onSelectChoice(questionIndex, index)}
                  label={determineLabel(choices, choiceIndex)}
                  inputType={inputType}
                  checked={determineChecked(choices, choiceIndex)}
                  onMove={this.onMove}
                  onDrop={this.onDrop}
                  checkDisabled={deleted}
                />
              ) : (
                <EditChoiceListItem
                  key={index}
                  placeholder={choicePlaceHolder[index]}
                  onSelect={() => onSelectChoice(questionIndex, index)}
                  checked={determineChecked(choices, choiceIndex)}
                  index={index}
                  text={editedChoiceTitles[index]}
                  onEdit={this.onEditChoice}
                />
              )
          )}
        </div>
        <div>
          {!onEdit ? (
            <Button
              info
              onClick={() => this.props.onEditStart(questionIndex)}
              style={{ opacity: deleted && '0.2' }}
              disabled={deleted && true}
            >
              Edit
            </Button>
          ) : (
            <div>
              <Button
                transparent
                onClick={() => this.onEditCancel(questionIndex)}
              >
                Cancel
              </Button>
              <Button
                primary
                style={{ marginLeft: '0.5em' }}
                onClick={() => this.onEditDone(questionIndex)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  onEditChoice = (index, value) => {
    const newTitles = this.state.editedChoiceTitles
    newTitles[index] = value
    this.setState({
      editedChoiceTitles: newTitles
    })
  }

  onEditCancel = questionIndex => {
    this.setState({
      editedChoiceTitles: this.props.choices.map(choice => {
        return choice.label
      }),
      editedQuestionTitle: this.props.title
    })
    this.props.onEditCancel(questionIndex)
  }

  onEditDone = questionIndex => {
    this.props.onEditDone({
      questionIndex,
      newChoicesArray: this.props.choices.map((choice, index) => ({
        ...choice,
        label: processedString(this.state.editedChoiceTitles[index])
      })),
      newTitle: processedString(this.state.editedQuestionTitle)
    })
  }

  onMove = ({ sourceId, targetId }) => {
    const newIndices = this.state.choiceIndices
    const sourceIndex = newIndices.indexOf(sourceId)
    const targetIndex = newIndices.indexOf(targetId)
    newIndices.splice(sourceIndex, 1)
    newIndices.splice(targetIndex, 0, sourceId)
    this.setState({ choiceIndices: newIndices })
  }

  onDrop = () => {
    const { questionIndex } = this.props
    const { choiceIndices } = this.state
    this.props.onRearrange({ questionIndex, choiceIndices })
  }
}

function determineLabel(choices, index) {
  let label = ''
  for (let i = 0; i < choices.length; i++) {
    if (choices[i].id === index) {
      label = choices[i].label
    }
  }
  return label
}

function determineChecked(choices, index) {
  let checked
  for (let i = 0; i < choices.length; i++) {
    if (choices[i].id === index) {
      checked = choices[i].checked
    }
  }
  return checked
}
