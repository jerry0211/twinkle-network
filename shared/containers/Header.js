import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import activeComponent from 'react-router-active-component'

import { getVideos } from 'actions/VideoActions';
import { getPinnedPlaylists, getPlaylists } from 'actions/PlaylistActions';
import * as UserActions from 'actions/UserActions';

import SigninModal from 'containers/SigninModal';

import { bindActionCreators } from 'redux';
import AccountMenu from 'components/AccountMenu';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

class Header extends Component {
  static contextTypes = {
    router: React.PropTypes.object,
    location: React.PropTypes.object
  }

  state = {
    tabClicked: false
  }

  componentWillMount() {
    this.props.dispatch(UserActions.checkSession())
  }

  handleClick() {
    this.setState({
      tabClicked: true
    })
  }

  render () {
    const { signinModalShown, loggedIn, username, usertype, isAdmin, userId, dispatch } = this.props;
    const { initSession, checkSession, openSigninModal, closeSigninModal } = UserActions;
    const NavLink = activeComponent('li')
    return (
      <Navbar staticTop fluid>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav onClick={this.handleClick.bind(this)}>
            <NavLink
              to="/"
              onlyActiveOnIndex
              linkProps={{className: 'navbar-brand'}}>
              Twinkle
            </NavLink>
            <NavLink to="/profile">
              Profile
            </NavLink>
            <NavLink to="/posts">
              Posts
            </NavLink>
            <NavLink to="/discussion">
              Discussion
            </NavLink>
            <NavLink to="/contents">
              Contents
            </NavLink>
            { isAdmin &&
              <NavLink to="/management">
                Management
              </NavLink>
            }
          </Nav>
          <Nav pullRight>
            {
              loggedIn ?
              <AccountMenu title={ username }
                {...bindActionCreators(UserActions, dispatch)} />
              : <NavItem onClick={ () => dispatch(openSigninModal()) }>Log In | Sign Up</NavItem>
            }
          </Nav>
        </Navbar.Collapse>
        <SigninModal show={signinModalShown} onHide={ () => dispatch(closeSigninModal()) } />
      </Navbar>
    )
  }
}

export default connect(
  state => ({
    loggedIn: state.UserReducer.loggedIn,
    username: state.UserReducer.username,
    usertype: state.UserReducer.usertype,
    isAdmin: state.UserReducer.isAdmin,
    userId: state.UserReducer.userId,
    signinModalShown: state.UserReducer.signinModalShown
  })
)(Header);