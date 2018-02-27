import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'emotion'
import { borderRadius, Color } from 'constants/css'
import Content from './Content'

export default class Modal extends Component {
  static propTypes = {
    children: PropTypes.node,
    onHide: PropTypes.func,
    small: PropTypes.bool
  }
  render() {
    const { children, onHide, small } = this.props
    const modalWidth = {
      default: '50%',
      small: '26%'
    }
    const marginLeft = {
      default: '25%',
      small: '37%'
    }
    let widthKey = 'default'
    if (small) widthKey = 'small'
    return (
      <div
        className={css`
          z-index: 2000;
          position: fixed;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          background: ${Color.black(0.5)};
        `}
      >
        <Content
          className={css`
            position: relative;
            border-radius: ${borderRadius};
            background: #fff;
            width: ${modalWidth[widthKey]};
            min-height: 30vh;
            margin-left: ${marginLeft[widthKey]};
            margin-top: 13vh;
            box-shadow: 3px 4px 5px ${Color.black(1)};
            display: flex;
            justify-content: center;
            flex-direction: column;
            height: auto;
            .close {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              top: 1rem;
              right: 1rem;
              border: none;
              width: 1.5rem;
              height: 1.5rem;
              cursor: pointer;
              position: absolute;
              opacity: 0.5;
              &:hover {
                opacity: 1;
              }
            }
            .modal-heading {
              display: flex;
              align-items: center;
              line-height: 2rem;
              color: ${Color.darkGray()};
              font-weight: bold;
              font-size: 2rem;
              padding: 2rem;
              margin-top: 0.5rem;
            }
            .modal-body {
              display: flex;
              padding: 1.5rem 2rem;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 20vh;
            }
            .modal-footer {
              padding: 1.5rem 1.5rem 1.5rem 1.5rem;
              display: flex;
              align-items: center;
              flex-direction: row-reverse;
              border-top: 1px solid ${Color.inputBorderGray()};
            }
          `}
          onHide={onHide}
        >
          {children}
        </Content>
      </div>
    )
  }
}