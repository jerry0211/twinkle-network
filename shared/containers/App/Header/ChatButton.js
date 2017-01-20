import React, {Component} from 'react';
import Button from 'components/Button';

export default class ChatButton extends Component {
  render() {
    const {onClick, chatMode, numUnreads = 0} = this.props;
    return (
      <li>
        <a style={{
            paddingTop: '6px',
            paddingBottom: '0px'
          }}>
          <Button
            className={`btn ${chatMode ? 'btn-warning' : 'btn-default'}`}
            onClick={() => onClick()}
          >
            {`${chatMode ? 'Close Chat' : (numUnreads > 0 ? 'Messages' : 'Open Chat')} `}
            {!chatMode && numUnreads > 0 &&
              <span
                className="badge"
                style={{backgroundColor: 'red'}}
                >{numUnreads}
              </span>
            }
          </Button>
        </a>
      </li>
    )
  }
}