const types = {
  CHANGE_PINNED: 'CHANGE_PINNED',
  CHANGE_VIDEOS: 'CHANGE_VIDEOS',
  CLOSE_REORDER_PINNED_PL_MODAL: 'CLOSE_REORDER_PINNED_PL_MODAL',
  CLOSE_SELECT_PL_TO_PIN_MODAL: 'CLOSE_SELECT_PL_TO_PIN_MODAL',
  DELETE: 'DELETE',
  EDIT_TITLE: 'EDIT_TITLE',
  LIKE_VIDEO: 'LIKE_VIDEO',
  LOAD: 'LOAD',
  LOAD_MORE: 'LOAD_MORE',
  LOAD_PINNED: 'LOAD_PINNED',
  LOAD_MORE_PL_LIST: 'LOAD_MORE_PL_LIST',
  OPEN_REORDER_PINNED_PL_MODAL: 'OPEN_REORDER_PINNED_PL_MODAL',
  OPEN_SELECT_PL_TO_PIN_MODAL: 'OPEN_SELECT_PL_TO_PIN_MODAL',
  RESET: 'RESET',
  TURN_OFF_CLICK_SAFE: 'TURN_OFF_CLICK_SAFE',
  TURN_ON_CLICK_SAFE: 'TURN_ON_CLICK_SAFE',
  UPLOAD: 'UPLOAD'
}

for (let key in types) {
  types[key] = `${types[key]}_PLAYLIST`
}

export default types