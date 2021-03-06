import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ExecutionEnvironment from 'exenv'
import Carousel from 'components/Carousel'
import VideoThumb from 'components/VideoThumb'
import DropdownButton from 'components/Buttons/DropdownButton'
import EditTitleForm from 'components/Texts/EditTitleForm'
import EditPlaylistModal from '../Modals/EditPlaylistModal'
import PlaylistModal from '../Modals/PlaylistModal'
import ConfirmModal from 'components/Modals/ConfirmModal'
import { addEvent } from 'helpers/listenerHelpers'
import {
  editPlaylistTitle,
  deletePlaylist
} from 'redux/actions/PlaylistActions'
import { connect } from 'react-redux'
import { cleanString } from 'helpers/stringHelpers'
import { css } from 'emotion'
import { Color } from 'constants/css'
import { charLimit } from 'constants/defaultValues'

class PlaylistCarousel extends Component {
  static propTypes = {
    arrayIndex: PropTypes.number.isRequired,
    canEdit: PropTypes.bool,
    canEditPlaylists: PropTypes.bool,
    clickSafe: PropTypes.bool.isRequired,
    deletePlaylist: PropTypes.func.isRequired,
    userIsUploader: PropTypes.bool,
    editPlaylistTitle: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    playlist: PropTypes.array.isRequired,
    showAllButton: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    uploader: PropTypes.string.isRequired
  }

  defaultNumSlides = 5

  constructor() {
    super()
    let numSlides = this.defaultNumSlides
    if (
      ExecutionEnvironment.canUseDOM &&
      document.documentElement.clientWidth <= 991
    ) {
      numSlides = 3
    }
    this.state = {
      onEdit: false,
      changePLVideosModalShown: false,
      reorderPLVideosModalShown: false,
      deleteConfirmModalShown: false,
      playlistModalShown: false,
      numSlides
    }
  }

  componentDidMount() {
    this.mounted = true
    addEvent(window, 'resize', this.onResize)
  }

  componentWillUnmount() {
    unbindListeners.call(this)
    this.mounted = false
    function unbindListeners() {
      if (ExecutionEnvironment.canUseDOM) {
        removeEvent(window, 'resize', this.onResize)
      }

      function removeEvent(elem, type, eventHandle) {
        if (elem === null || typeof elem === 'undefined') {
          return
        }
        if (elem.removeEventListener) {
          elem.removeEventListener(type, eventHandle, false)
        } else if (elem.detachEvent) {
          elem.detachEvent('on' + type, eventHandle)
        } else {
          elem['on' + type] = null
        }
      }
    }
  }

  render() {
    const {
      onEdit,
      changePLVideosModalShown,
      reorderPLVideosModalShown,
      deleteConfirmModalShown,
      playlistModalShown,
      numSlides
    } = this.state
    const {
      canEdit,
      canEditPlaylists,
      title,
      uploader,
      userIsUploader,
      id,
      showAllButton
    } = this.props
    const menuProps = [
      {
        label: 'Edit Title',
        onClick: this.onEditTitle
      },
      {
        label: 'Change Videos',
        onClick: () => this.setState({ changePLVideosModalShown: true })
      },
      {
        label: 'Reorder Videos',
        onClick: () => this.setState({ reorderPLVideosModalShown: true })
      },
      {
        separator: true
      },
      {
        label: 'Remove Playlist',
        onClick: this.onDeleteClick
      }
    ]

    return (
      <div
        className={css`
          margin-bottom: 1.5rem;
          &:last-child {
            margin-bottom: 0;
          }
        `}
      >
        <div
          className={css`
            position: relative;
            display: flex;
            align-items: center;
            padding-bottom: 0.8rem;
            h2 {
              cursor: pointer;
              display: inline;
              color: ${Color.blue()};
              &:hover {
                color: ${Color.logoBlue()};
              }
            }
            small {
              font-size: 1.5rem;
              color: ${Color.darkGray()};
            }
          `}
        >
          {onEdit ? (
            <EditTitleForm
              autoFocus
              maxLength={charLimit.playlist.title}
              style={{ width: '90%' }}
              title={title}
              onEditSubmit={this.onEditedTitleSubmit}
              onClickOutSide={this.onEditTitleCancel}
            />
          ) : (
            <div>
              <h2 onClick={() => this.setState({ playlistModalShown: true })}>
                {cleanString(title)}
                &nbsp;<small>by {uploader}</small>
              </h2>
            </div>
          )}
          {(userIsUploader || canEditPlaylists || canEdit) && (
            <DropdownButton
              snow
              style={{ position: 'absolute', right: 0 }}
              direction="left"
              icon="pencil"
              menuProps={menuProps}
            />
          )}
        </div>
        <Carousel
          progressBar={false}
          slidesToShow={numSlides}
          slidesToScroll={numSlides}
          cellSpacing={20}
          slideWidth={0.99}
          dragging={true}
          showAllButton={showAllButton}
          onShowAll={() => this.setState({ playlistModalShown: true })}
        >
          {this.renderThumbs()}
        </Carousel>
        {playlistModalShown && (
          <PlaylistModal
            title={cleanString(title)}
            onHide={() => this.setState({ playlistModalShown: false })}
            playlistId={id}
          />
        )}
        {changePLVideosModalShown && (
          <EditPlaylistModal
            modalType="change"
            playlistId={id}
            onHide={() => this.setState({ changePLVideosModalShown: false })}
          />
        )}
        {reorderPLVideosModalShown && (
          <EditPlaylistModal
            modalType="reorder"
            playlistId={id}
            onHide={() => this.setState({ reorderPLVideosModalShown: false })}
          />
        )}
        {deleteConfirmModalShown && (
          <ConfirmModal
            title="Remove Playlist"
            onConfirm={this.onDeleteConfirm}
            onHide={() => this.setState({ deleteConfirmModalShown: false })}
          />
        )}
      </div>
    )
  }

  renderThumbs = () => {
    const { playlist, clickSafe, id: playlistId } = this.props
    return playlist.map((thumb, index) => {
      return (
        <VideoThumb
          to={`videos/${thumb.videoId}?playlist=${playlistId}`}
          clickSafe={clickSafe}
          key={index}
          video={{
            id: thumb.videoId,
            content: thumb.content,
            isStarred: thumb.isStarred,
            title: thumb.video_title,
            description: thumb.video_description,
            uploaderName: thumb.video_uploader,
            numLikes: thumb.numLikes
          }}
          user={{ name: thumb.video_uploader, id: thumb.video_uploader_id }}
        />
      )
    })
  }

  onEditTitle = () => {
    this.setState({ onEdit: true })
  }

  onEditedTitleSubmit = async title => {
    const { editPlaylistTitle, id: playlistId, arrayIndex } = this.props
    await editPlaylistTitle({ title, playlistId }, arrayIndex)
    this.setState({ onEdit: false })
  }

  onEditTitleCancel = () => {
    this.setState({ onEdit: false })
  }

  onDeleteClick = () => {
    this.setState({ deleteConfirmModalShown: true })
  }

  onDeleteConfirm = async() => {
    const { deletePlaylist, id } = this.props
    this.setState({ deleteConfirmModalShown: false })
    deletePlaylist(id)
  }

  onResize = () => {
    this.setState({
      numSlides:
        document.documentElement.clientWidth <= 991 ? 3 : this.defaultNumSlides
    })
  }
}

export default connect(
  state => ({
    canEdit: state.UserReducer.canEdit,
    canEditPlaylists: state.UserReducer.canEditPlaylists,
    clickSafe: state.PlaylistReducer.clickSafe
  }),
  {
    editPlaylistTitle,
    deletePlaylist
  }
)(PlaylistCarousel)
