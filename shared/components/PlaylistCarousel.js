import React, { Component } from 'react';
import Carousel from 'nuka-carousel';
import VideoThumb from './VideoThumb';
import SmallDropdownButton from './SmallDropdownButton';

class PlaylistCarousel extends Component {
  state = {
    onEdit: false
  }

  renderThumbs () {
    const { playlist } = this.props;
    let index = 0;
    return playlist.map(thumb => {
      return (
        <VideoThumb key={index++} video={{
          videocode: thumb.videocode,
          title: thumb.video_title,
          uploadername: thumb.video_uploader
        }} />
      )
    })
  }

  onEditTitle() {
    this.setState({onEdit: true})
  }

  onDeleteClick() {

  }

  render () {
    const { onEdit } = this.state;
    const { title, uploader, editable } = this.props;
    const menuProps = [
      {
        label: 'Edit Title',
        onClick: this.onEditTitle.bind(this)
      },
      {
        label: 'Change Videos',
        onClick: this.onEditTitle.bind(this)
      },
      {
        label: 'Reorder Videos',
        onClick: this.onEditTitle.bind(this)
      },
      {
        separator: true
      },
      {
        label: 'Remove Playlist',
        onClick: this.onDeleteClick.bind(this)
      }
    ]
    return (
      <div className="container-fluid">
        <div className="row container-fluid">
          {
            onEdit ?
            <div
              className="input-group col-sm-6 pull-left"
              style={{
                paddingBottom: '0.3em'
              }}
            >
              <form>
                <input
                  ref="editTitleInput"
                  type="text"
                  className="form-control"
                  placeholder="Enter Title..."
                />
              </form>
            </div>
            :
            <h4
              className="pull-left"
            >
              {title} <small>by {uploader}</small>
            </h4>
          }
          {
            editable && <SmallDropdownButton
              menuProps={menuProps}
              rightMargin="1em"
            />
          }
        </div>
        <Carousel slidesToShow={5} slidesToScroll={5} cellSpacing={20}>
          { this.renderThumbs() }
        </Carousel>
      </div>
    )
  }
}

export default PlaylistCarousel;
