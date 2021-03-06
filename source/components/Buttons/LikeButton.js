import PropTypes from 'prop-types'
import React from 'react'
import Button from 'components/Button'

LikeButton.propTypes = {
  liked: PropTypes.bool.isRequired,
  filled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  small: PropTypes.bool,
  style: PropTypes.object,
  targetLabel: PropTypes.string
}
export default function LikeButton({
  filled,
  style,
  liked,
  onClick,
  small,
  targetLabel
}) {
  return (
    <Button
      logo={(filled && liked) || !filled}
      info={filled && !liked}
      filled={filled || liked}
      style={style}
      onClick={onClick}
    >
      <span className="glyphicon glyphicon-thumbs-up" />{' '}
      {liked
        ? `${targetLabel ? targetLabel + ' ' : ''}Liked!`
        : `Like${targetLabel ? ' ' + targetLabel : ''}`}
    </Button>
  )
}
