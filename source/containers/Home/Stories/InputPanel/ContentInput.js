import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Textarea from 'components/Texts/Textarea'
import Button from 'components/Button'
import { uploadContent } from 'redux/actions/FeedActions'
import { loadVideoPageFromClientSide } from 'redux/actions/VideoActions'
import Input from 'components/Texts/Input'
import { scrollElementToCenter } from 'helpers/domHelpers'
import {
  exceedsCharLimit,
  isValidUrl,
  isValidYoutubeUrl,
  stringIsEmpty,
  addEmoji,
  finalizeEmoji,
  renderCharLimit
} from 'helpers/stringHelpers'
import Banner from 'components/Banner'
import { PanelStyle } from './Styles'
import { innerBorderRadius, Color } from 'constants/css'
import { css } from 'emotion'

class ContentInput extends Component {
  static propTypes = {
    uploadContent: PropTypes.func.isRequired
  }

  state = {
    descriptionFieldsShown: false,
    form: {
      url: '',
      checkedVideo: false,
      title: '',
      description: ''
    },
    urlError: null
  }

  render() {
    const { form, urlError, descriptionFieldsShown } = this.state
    return (
      <div className={PanelStyle}>
        <p>Share interesting videos or web links</p>
        {urlError && (
          <Banner love style={{ marginBottom: '1rem' }}>
            {urlError}
          </Banner>
        )}
        <Input
          inputRef={ref => {
            this.UrlField = ref
          }}
          style={this.errorInUrlField()}
          value={form.url}
          onChange={this.onUrlFieldChange}
          placeholder="Copy the URL address of a website or a YouTube video and paste it here"
          type="text"
        />
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            postion: 'relative',
            width: '100%'
          }}
        >
          <span style={{ fontSize: '1.2rem', color: Color.darkGray() }}>
            YouTube Video:&nbsp;&nbsp;
          </span>
          <div
            onClick={() => {
              this.setState({
                form: {
                  ...form,
                  checkedVideo: !form.checkedVideo
                },
                urlError: null
              })
            }}
            style={{
              borderRadius: innerBorderRadius,
              border: `1px solid ${Color.borderGray()}`,
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: form.checkedVideo
                ? Color.logoBlue()
                : Color.wellGray()
            }}
          >
            {form.checkedVideo && (
              <div
                className={css`
                  display: inline-block;
                  width: 0.6rem;
                  height: 1rem;
                  margin-top: 2%;
                  border: solid #fff;
                  border-width: 0 3px 3px 0;
                  transform: rotate(45deg);
                `}
              />
            )}
          </div>
        </div>
        {descriptionFieldsShown && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Input
                value={form.title}
                onChange={text =>
                  this.setState({ form: { ...form, title: text } })
                }
                placeholder="Enter Title"
                onKeyUp={event => {
                  if (event.key === ' ') {
                    this.setState({
                      form: {
                        ...this.state.form,
                        title: addEmoji(event.target.value)
                      }
                    })
                  }
                }}
                style={this.titleExceedsCharLimit()}
                type="text"
              />
              {this.titleExceedsCharLimit() && (
                <small style={{ color: 'red' }}>
                  {this.renderTitleCharLimit()}
                </small>
              )}
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
                        ...this.state.form,
                        description: addEmoji(event.target.value)
                      }
                    })
                  }
                }}
                style={{
                  marginTop: '1rem',
                  ...(this.descriptionExceedsCharLimit() || {})
                }}
              />
              {this.descriptionExceedsCharLimit() && (
                <small style={{ color: 'red' }}>
                  {this.renderDescriptionCharLimit()}
                </small>
              )}
            </div>
            <div className="button-container">
              <Button
                type="submit"
                filled
                success
                style={{ marginTop: '1rem' }}
                disabled={this.buttonDisabled()}
                onClick={this.onSubmit}
              >
                Share!
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  buttonDisabled = () => {
    const {
      form: { url, title }
    } = this.state
    let result = false
    if (stringIsEmpty(url) || stringIsEmpty(title)) return true
    if (this.errorInUrlField()) result = true
    if (this.titleExceedsCharLimit()) result = true
    if (this.descriptionExceedsCharLimit()) result = true
    return result
  }

  errorInUrlField = () => {
    const {
      form: { checkedVideo, url },
      urlError
    } = this.state
    if (urlError) return { borderColor: 'red', color: 'red' }
    return exceedsCharLimit({
      inputType: 'url',
      contentType: checkedVideo ? 'video' : 'url',
      text: url
    })
  }

  onSubmit = event => {
    const { uploadContent } = this.props
    const { form } = this.state
    const { url, checkedVideo } = form
    let urlError
    event.preventDefault()

    if (!isValidUrl(url)) urlError = 'That is not a valid url'
    if (checkedVideo && !isValidYoutubeUrl(url)) {
      urlError = 'That is not a valid YouTube url'
    }

    if (urlError) {
      this.setState({ urlError })
      this.UrlField.focus()
      return scrollElementToCenter(this.UrlField)
    }

    this.setState({
      descriptionFieldsShown: false,
      form: {
        url: '',
        checkedVideo: false,
        title: '',
        description: ''
      },
      urlError: null
    })
    uploadContent({
      ...form,
      title: finalizeEmoji(form.title),
      description: finalizeEmoji(form.description)
    })
    document.getElementById('App').scrollTop = 0
  }

  onUrlFieldChange = url => {
    const { form } = this.state
    this.setState({
      form: {
        ...form,
        url,
        checkedVideo: isValidYoutubeUrl(url) || form.checkedVideo
      },
      urlError: null,
      descriptionFieldsShown: true
    })
  }

  renderDescriptionCharLimit = () => {
    const {
      form: { checkedVideo, description }
    } = this.state
    return renderCharLimit({
      inputType: 'description',
      contentType: checkedVideo ? 'video' : 'url',
      text: description
    })
  }

  renderTitleCharLimit = () => {
    const {
      form: { checkedVideo, title }
    } = this.state
    return renderCharLimit({
      inputType: 'title',
      contentType: checkedVideo ? 'video' : 'url',
      text: title
    })
  }

  descriptionExceedsCharLimit = () => {
    const {
      form: { checkedVideo, description }
    } = this.state
    return exceedsCharLimit({
      inputType: 'description',
      contentType: checkedVideo ? 'video' : 'url',
      text: description
    })
  }

  titleExceedsCharLimit = () => {
    const {
      form: { checkedVideo, title }
    } = this.state
    return exceedsCharLimit({
      inputType: 'title',
      contentType: checkedVideo ? 'video' : 'url',
      text: title
    })
  }
}

export default connect(
  state => ({
    username: state.UserReducer.username
  }),
  {
    loadVideoPage: loadVideoPageFromClientSide,
    uploadContent
  }
)(ContentInput)
