import USER from '../constants/User'

const defaultState = {
  authLevel: 0,
  canDelete: false,
  canEdit: false,
  canStar: false,
  canEditPlaylists: false,
  canPinPlaylists: false,
  isCreator: false,
  profile: {},
  profiles: [],
  searchedProfiles: [],
  loadMoreButton: false
}

export default function UserReducer(state = defaultState, action) {
  let loadMoreButton = false
  switch (action.type) {
    case USER.CHANGE_XP:
      return {
        ...state,
        twinkleXP: action.xp,
        rank: action.rank
      }
    case USER.CLEAR_SEARCH:
      return {
        ...state,
        searchedProfiles: []
      }
    case USER.INIT_SESSION:
      return {
        ...state,
        ...action.data,
        isCreator: action.data.userType === 'creator'
      }
    case USER.LOAD_USERS:
      if (action.data.length > 20) {
        action.data.pop()
        loadMoreButton = true
      }
      return {
        ...state,
        profiles: action.data,
        loadMoreButton
      }
    case USER.LOAD_MORE_USERS:
      if (action.data.length > 5) {
        action.data.pop()
        loadMoreButton = true
      }
      return {
        ...state,
        profiles: state.profiles.concat(action.data),
        loadMoreButton
      }
    case USER.SEARCH:
      return {
        ...state,
        searchedProfiles: action.users
      }
    case USER.NOT_EXIST:
      return {
        ...state,
        profile: {
          unavailable: true
        }
      }
    case USER.SHOW_PROFILE:
      return {
        ...state,
        profile: action.data
      }
    case USER.LOGIN:
      return {
        ...state,
        ...action.data,
        loggedIn: true,
        signinModalShown: false,
        isCreator: action.data.userType === 'creator'
      }
    case USER.LOGOUT:
      return {
        authLevel: 0,
        canDelete: false,
        canEdit: false,
        canStar: false,
        canEditPlaylists: false,
        canPinPlaylists: false,
        isCreator: false,
        profile: state.profile,
        profiles: state.profiles,
        searchedProfiles: state.searchedProfiles
      }
    case USER.SIGNUP:
      return {
        ...state,
        ...action.data,
        loggedIn: true,
        signinModalShown: false
      }
    case USER.OPEN_SIGNIN_MODAL:
      return {
        ...state,
        signinModalShown: true
      }
    case USER.CLOSE_SIGNIN_MODAL:
      return {
        ...state,
        signinModalShown: false
      }
    case USER.DELETE_STATUS_MSG:
      return {
        ...state,
        profile: {
          ...state.profile,
          statusMsg: '',
          statusColor: ''
        },
        profiles: state.profiles.map(profile => ({
          ...profile,
          ...(profile.id === action.userId
            ? { statusMsg: '', statusColor: '' }
            : {})
        }))
      }
    case USER.EDIT_BIO:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.bio
        },
        profiles: state.profiles.map(profile => ({
          ...profile,
          ...(profile.id === action.userId ? action.bio : {})
        }))
      }
    case USER.EDIT_PROFILE_PICTURE:
      return {
        ...state,
        profilePicId: action.data.imageId,
        profile: {
          ...state.profile,
          profilePicId:
            state.profile.id === action.data.userId
              ? action.data.imageId
              : state.profile.profilePicId
        },
        profiles: state.profiles.map(profile => ({
          ...profile,
          profilePicId:
            profile.id === action.data.userId
              ? action.data.imageId
              : profile.profilePicId
        }))
      }
    case USER.EDIT_STATUS_MSG:
      return {
        ...state,
        profile: {
          ...state.profile,
          statusMsg: action.statusMsg,
          statusColor: action.statusColor
        },
        profiles: state.profiles.map(profile => ({
          ...profile,
          ...(profile.id === action.userId
            ? { statusMsg: action.statusMsg, statusColor: action.statusColor }
            : {})
        }))
      }
    default:
      return state
  }
}
