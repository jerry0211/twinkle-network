import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {loadRightMenuVideos, loadMorePlaylistVideos} from 'redux/actions/VideoActions'
import {Link} from 'react-router-dom'
import {Color} from 'constants/css'
import {cleanString} from 'helpers/stringHelpers'
import {queryStringForArray} from 'helpers/apiHelpers'
import FlatLoadMoreButton from 'components/LoadMoreButton/Flat'

@connect(
  state => ({
    nextVideos: state.VideoReducer.videoPage.nextVideos,
    relatedVideos: state.VideoReducer.videoPage.relatedVideos,
    otherVideos: state.VideoReducer.videoPage.otherVideos,
    playlistVideos: state.VideoReducer.videoPage.playlistVideos,
    playlistVideosLoadMoreShown: state.VideoReducer.videoPage.playlistVideosLoadMoreShown,
    playlistTitle: state.VideoReducer.videoPage.playlistTitle
  }),
  {
    loadMorePlaylistVideos,
    loadRightMenuVideos
  }
)
export default class RightMenu extends Component {
  static propTypes = {
    loadMorePlaylistVideos: PropTypes.func,
    loadRightMenuVideos: PropTypes.func,
    videoId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    playlistId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    nextVideos: PropTypes.array,
    playlistVideos: PropTypes.array,
    playlistVideosLoadMoreShown: PropTypes.bool,
    playlistTitle: PropTypes.string,
    relatedVideos: PropTypes.array,
    otherVideos: PropTypes.array
  }

  constructor() {
    super()
    this.state = {
      playlistVideosLoading: false
    }
    this.loadMorePlaylistVideos = this.loadMorePlaylistVideos.bind(this)
    this.renderVideos = this.renderVideos.bind(this)
  }

  componentDidMount() {
    const {loadRightMenuVideos, videoId, playlistId} = this.props
    loadRightMenuVideos(videoId, playlistId)
  }

  componentDidUpdate(prevProps) {
    const {loadRightMenuVideos, nextVideos, videoId, playlistId} = this.props
    if (!nextVideos || (videoId && (prevProps.videoId !== videoId))) {
      loadRightMenuVideos(videoId, playlistId)
    }
  }

  render() {
    const {
      nextVideos = [], relatedVideos = [], otherVideos = [], playlistVideos = [],
      playlistTitle, playlistVideosLoadMoreShown
    } = this.props
    const {playlistVideosLoading} = this.state
    const noVideos =
      nextVideos.length + relatedVideos.length + otherVideos.length + playlistVideos.length === 0
    return (
      <div>
        {!noVideos &&
          <div
            className="col-xs-offset-8 col-xs-4"
            style={{
              width: '30%',
              backgroundColor: '#fff',
              position: 'absolute',
              paddingBottom: '2em'
            }}
          >
            <div>
              {nextVideos.length > 0 && <h3>Up Next</h3>}
              {this.renderVideos(nextVideos)}
              {playlistVideos.length > 0 && <h3>{playlistTitle}</h3>}
              {this.renderVideos(playlistVideos)}
              {playlistVideosLoadMoreShown && <FlatLoadMoreButton
                isLoading={playlistVideosLoading}
                onClick={this.loadMorePlaylistVideos}
                style={{marginTop: '1.5em'}}
              />}
              {relatedVideos.length > 0 && <h3>Related Videos</h3>}
              {this.renderVideos(relatedVideos)}
              {otherVideos.length > 0 && <h3>Recent Videos</h3>}
              {this.renderVideos(otherVideos)}
            </div>
          </div>
        }
      </div>
    )
  }

  loadMorePlaylistVideos() {
    const {loadMorePlaylistVideos, playlistId, playlistVideos} = this.props
    this.setState({playlistVideosLoading: true})
    return loadMorePlaylistVideos(
      playlistId, queryStringForArray(playlistVideos, 'videoId', 'shownVideos')
    ).then(
      () => this.setState({playlistVideosLoading: false})
    )
  }

  renderVideos(videos) {
    const {playlistId} = this.props
    return videos.map(video => (
      <div
        key={video.id}
        className="media"
      >
        <div className="media-left media-middle">
          <Link to={`/videos/${video.videoId}${playlistId ? `?playlist=${playlistId}` : ''}`}>
            <img
              className="media-object"
              src={`https://img.youtube.com/vi/${video.content}/mqdefault.jpg`}
              alt="..."
              style={{width: '18rem'}}
            />
          </Link>
        </div>
        <div className="media-body">
          <Link to={`/videos/${video.videoId}${playlistId ? `?playlist=${playlistId}` : ''}`}>
            <p style={{fontSize: '1.2em'}} className="media-heading">{cleanString(video.title)}</p>
          </Link>
          <small style={{color: Color.gray}}>Uploaded by {video.username}</small>
        </div>
      </div>
    ))
  }
}
