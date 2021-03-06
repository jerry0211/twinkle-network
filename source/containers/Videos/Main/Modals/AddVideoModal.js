import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Textarea from 'components/Texts/Textarea'
import Modal from 'components/Modal'
import Button from 'components/Button'
import { uploadVideo } from 'redux/actions/VideoActions'
import { connect } from 'react-redux'
import Input from 'components/Texts/Input'
import {
  exceedsCharLimit,
  isValidYoutubeUrl,
  stringIsEmpty,
  addEmoji,
  finalizeEmoji,
  renderCharLimit
} from 'helpers/stringHelpers'

class AddVideoModal extends Component {
  static propTypes = {
    onHide: PropTypes.func.isRequired,
    uploadVideo: PropTypes.func.isRequired
  }

  state = {
    urlError: null,
    form: {
      url: '',
      title: '',
      description: ''
    }
  }

  render() {
    const { onHide } = this.props
    const { urlError, form, form: { title, description } } = this.state
    const titleExceedsCharLimit = exceedsCharLimit({
      inputType: 'title',
      contentType: 'video',
      text: title
    })
    const descriptionExceedsCharLimit = exceedsCharLimit({
      inputType: 'description',
      contentType: 'video',
      text: description
    })
    return (
      <Modal onHide={onHide}>
        <header>Add Videos</header>
        <main>
          <form style={{ width: '100%' }}>
            <section>
              <Input
                ref={ref => {
                  this.UrlField = ref
                }}
                value={form.url}
                onChange={this.onUrlFieldChange}
                placeholder="Paste video's YouTube url here"
                type="text"
                style={this.urlHasError()}
              />
              {urlError && (
                <span
                  style={{
                    color: 'red',
                    lineHeight: '3rem',
                    marginBottom: '0px'
                  }}
                >
                  {urlError}
                </span>
              )}
            </section>
            <section style={{ marginTop: '1rem' }}>
              <Input
                value={form.title}
                onChange={text =>
                  this.setState({ form: { ...form, title: text } })
                }
                placeholder="Enter Title"
                type="text"
                onKeyUp={event => {
                  if (event.key === ' ') {
                    this.setState({
                      form: {
                        ...form,
                        title: addEmoji(event.target.value)
                      }
                    })
                  }
                }}
                style={titleExceedsCharLimit}
              />
              {titleExceedsCharLimit && (
                <small style={{ color: 'red' }}>
                  {renderCharLimit({
                    contentType: 'video',
                    inputType: 'title',
                    text: title
                  })}
                </small>
              )}
            </section>
            <section style={{ marginTop: '1rem', position: 'relative' }}>
              <Textarea
                value={form.description}
                minRows={4}
                placeholder="Enter Description (Optional, you don't need to write this)"
                onChange={event =>
                  this.setState({
                    form: { ...form, description: event.target.value }
                  })
                }
                onKeyUp={event => {
                  if (event.key === ' ') {
                    this.setState({
                      form: {
                        ...form,
                        description: addEmoji(event.target.value)
                      }
                    })
                  }
                }}
                style={descriptionExceedsCharLimit}
              />
              {descriptionExceedsCharLimit && (
                <small style={{ color: 'red' }}>
                  {renderCharLimit({
                    contentType: 'video',
                    inputType: 'description',
                    text: description
                  })}
                </small>
              )}
            </section>
          </form>
        </main>
        <footer>
          <Button
            primary
            type="submit"
            onClick={this.onSubmit}
            disabled={this.submitDisabled()}
          >
            Add
          </Button>
          <Button style={{ marginRight: '1rem' }} transparent onClick={onHide}>
            Cancel
          </Button>
        </footer>
      </Modal>
    )
  }

  onSubmit = event => {
    const { uploadVideo } = this.props
    const { form: { url, title, description } } = this.state

    event.preventDefault()
    if (!isValidYoutubeUrl(url)) {
      this.setState({ urlError: 'That is not a valid YouTube url' })
      return this.UrlField._rootDOMNode.focus()
    }

    uploadVideo({
      url,
      title: finalizeEmoji(title),
      description: finalizeEmoji(description)
    })
  }

  onUrlFieldChange = text => {
    const { form } = this.state
    this.setState({
      form: { ...form, url: text },
      urlError: null
    })
  }

  submitDisabled = () => {
    const { form: { url, description, title } } = this.state
    if (stringIsEmpty(url) || stringIsEmpty(title)) return true
    if (this.urlHasError()) return true
    if (
      exceedsCharLimit({
        inputType: 'description',
        contentType: 'video',
        text: description
      })
    ) {
      return true
    }
    return false
  }

  urlHasError = () => {
    const { form: { url }, urlError } = this.state
    if (urlError) return { color: 'red', borderColor: 'red' }
    return exceedsCharLimit({
      contentType: 'video',
      inputType: 'url',
      text: url
    })
  }
}

export default connect(null, { uploadVideo })(AddVideoModal)
