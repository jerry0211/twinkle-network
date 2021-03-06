import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Comment from './Comment'
import { connect } from 'react-redux'
import Button from 'components/Button'
import Loading from 'components/Loading'
import {
  editVideoComment,
  deleteVideoComment,
  likeVideoComment,
  uploadVideoReply,
  loadMoreComments,
  loadVideoComments,
  loadMoreReplies
} from 'redux/actions/VideoActions'
import { css } from 'emotion'

class Comments extends Component {
  static propTypes = {
    comments: PropTypes.array.isRequired,
    discussions: PropTypes.array.isRequired,
    loadMoreCommentsButton: PropTypes.bool.isRequired,
    loadMoreComments: PropTypes.func.isRequired,
    loadMoreDiscussionsButton: PropTypes.bool.isRequired,
    loadMoreReplies: PropTypes.func.isRequired,
    loadVideoComments: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEditDone: PropTypes.func.isRequired,
    onLikeClick: PropTypes.func.isRequired,
    onReplySubmit: PropTypes.func.isRequired,
    videoId: PropTypes.number.isRequired
  }

  state = {
    lastDeletedCommentIndex: null,
    deleteListenerToggle: false,
    loading: false
  }

  componentDidMount() {
    const { loadVideoComments, videoId } = this.props
    this.setState({ loading: true })
    loadVideoComments(videoId).then(() => this.setState({ loading: false }))
  }

  async componentDidUpdate(prevProps) {
    const { comments, loadVideoComments, videoId } = this.props
    const { deleteListenerToggle } = this.state
    if (prevProps.comments.length > comments.length) {
      if (comments.length === 0) return
      this.setState({ deleteListenerToggle: !deleteListenerToggle })
    }

    if (prevProps.videoId !== videoId) {
      this.setState({ loading: true })
      await loadVideoComments(videoId)
      this.setState({ loading: false })
    }
  }

  render() {
    const {
      loadMoreCommentsButton,
      loadMoreComments,
      videoId,
      comments
    } = this.props
    return (
      <div
        className={css`
          padding: 1rem 0;
          background: #fff;
          font-size: 1.7rem;
          margin-top: 1rem;
        `}
      >
        <div style={{ width: '100%' }}>
          <div
            ref={ref => {
              this.Comments = ref
            }}
            style={{
              padding: '0 1rem',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {this.renderComments()}
            {loadMoreCommentsButton && (
              <Button
                transparent
                style={{ fontSize: '2rem' }}
                onClick={() =>
                  loadMoreComments({
                    videoId,
                    lastCommentId: comments[comments.length - 1].id
                  })
                }
              >
                Load More
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  renderComments = () => {
    const {
      comments,
      loadMoreReplies,
      onDelete,
      onEditDone,
      onLikeClick,
      onReplySubmit
    } = this.props
    const { loading } = this.state
    const { lastDeletedCommentIndex, deleteListenerToggle } = this.state
    if (comments.length === 0) {
      return loading ? (
        <Loading />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '4rem'
          }}
        >
          There are no comments, yet.
        </div>
      )
    }
    return comments.map((comment, index) => {
      return (
        <Comment
          {...this.props}
          index={index}
          comment={comment}
          onEditDone={onEditDone}
          onLoadMoreReplies={loadMoreReplies}
          onDelete={onDelete}
          onLikeClick={onLikeClick}
          onReplySubmit={onReplySubmit}
          marginTop={index !== 0}
          key={comment.id}
          commentId={comment.id}
          deleteCallback={this.deleteCallback}
          lastDeletedCommentIndex={lastDeletedCommentIndex}
          deleteListenerToggle={deleteListenerToggle}
        />
      )
    })
  }

  deleteCallback = index => {
    this.setState({ lastDeletedCommentIndex: index })
  }
}

export default connect(null, {
  onEditDone: editVideoComment,
  onDelete: deleteVideoComment,
  onLikeClick: likeVideoComment,
  onReplySubmit: uploadVideoReply,
  loadMoreComments,
  loadVideoComments,
  loadMoreReplies
})(Comments)
