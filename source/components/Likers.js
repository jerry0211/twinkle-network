import PropTypes from 'prop-types'
import React from 'react'
import UsernameText from 'components/Texts/UsernameText'
import { Color } from 'constants/css'

Likers.propTypes = {
  className: PropTypes.string,
  defaultText: PropTypes.string,
  likes: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired
    })
  ).isRequired,
  onLinkClick: PropTypes.func.isRequired,
  style: PropTypes.object,
  target: PropTypes.string,
  userId: PropTypes.number
}
export default function Likers({
  likes,
  target,
  userId,
  onLinkClick,
  style = {},
  className,
  defaultText
}) {
  return (
    <div style={style} className={className}>
      {renderLikers()}
    </div>
  )

  function renderLikers() {
    let userLiked = false
    let totalLikes = 0
    if (likes) {
      for (let i = 0; i < likes.length; i++) {
        if (likes[i].userId === userId) userLiked = true
        totalLikes++
      }
    }
    if (userLiked) {
      totalLikes--
      if (totalLikes > 0) {
        if (totalLikes === 1) {
          let otherLikes = likes.filter(like => like.userId !== userId)
          return (
            <div>
              You and{' '}
              <UsernameText
                color={Color.blue()}
                user={{
                  id: otherLikes[0].userId,
                  name: otherLikes[0].username
                }}
              />{' '}
              like {`this${target ? ' ' + target : ''}.`}
            </div>
          )
        } else {
          return (
            <div>
              You and{' '}
              <a
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => onLinkClick()}
              >
                {totalLikes} others
              </a>{' '}
              like {`this${target ? ' ' + target : ''}.`}
            </div>
          )
        }
      }
      return <div>You like {`this${target ? ' ' + target : ''}.`}</div>
    } else if (totalLikes > 0) {
      if (totalLikes === 1) {
        return (
          <div>
            <UsernameText
              color={Color.blue()}
              user={{ id: likes[0].userId, name: likes[0].username }}
            />{' '}
            likes {`this${target ? ' ' + target : ''}.`}
          </div>
        )
      } else {
        return (
          <div>
            <a
              style={{ cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => onLinkClick()}
            >
              {totalLikes} people
            </a>{' '}
            like {`this${target ? ' ' + target : ''}.`}
          </div>
        )
      }
    } else {
      return defaultText ? <div>{defaultText}</div> : null
    }
  }
}
