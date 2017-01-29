const {generalChatId} = require('../siteConfig')
const {poolQuery} = require('../helpers')

const fetchChat = (params) => {
  const user = params.user
  let channelId = params.channelId ? params.channelId : generalChatId
  let results = {
    channels: [],
    messages: [],
    currentChannel: {}
  }

  return checkIfLastChannelExists().then(
    () => checkIfUserIsAMember()
  ).then(
    () => fetchChannelsAndMessages()
  ).then(
    () => fetchCurrentChannel()
  ).then(
    () => {
      updateLastRead({users: [{id: user.id}], channelId, timeStamp: Math.floor(Date.now()/1000)})
      return Promise.resolve(results)
    }
  )

  function checkIfLastChannelExists() {
    if (channelId === generalChatId) return Promise.resolve()
    let query = 'SELECT * FROM msg_channels WHERE id = ?'
    return poolQuery(query, channelId).then(
      rows => {
        if (!rows || rows.length === 0) {
          return poolQuery('UPDATE users SET ? WHERE id = ?', [{lastChannelId: generalChatId}, user.id]).then(
            () => {
              channelId = generalChatId
              return Promise.resolve()
            }
          )
        }
        return Promise.resolve()
      }
    )
  }

  function checkIfUserIsAMember() {
    if (channelId === generalChatId) return Promise.resolve()
    let query = 'SELECT * FROM msg_channel_members WHERE channelId = ? AND userId = ?'
    poolQuery(query, [channelId, user.id]).then(
      rows => {
        if (!rows || rows.length === 0) {
          channelId = generalChatId
          return poolQuery('UPDATE users SET ? WHERE id = ?', [{lastChannelId: generalChatId}, user.id])
        }
        return Promise.resolve()
      }
    )
  }

  function fetchChannelsAndMessages() {
    return Promise.all([fetchChannels(user), fetchMessages(channelId)]).then(
      channelsAndMessages => {
        results.channels = channelsAndMessages[0]
        results.messages = channelsAndMessages[1]
        return Promise.resolve()
      }
    )
  }

  function fetchCurrentChannel() {
    let query1 = 'SELECT twoPeople, creator FROM msg_channels WHERE id = ?'
    let query2 = `
      SELECT a.userId, b.username FROM msg_channel_members a JOIN users b
      ON a.userId = b.id WHERE a.channelId = ?
    `

    return Promise.all([poolQuery(query1, channelId), poolQuery(query2, channelId)]).then(
      res => {
        results.currentChannel = {
          id: channelId,
          twoPeople: Boolean(res[0][0].twoPeople),
          creatorId: res[0][0].creator,
          members: res[1]
        }
        return Promise.resolve()
      }
    ).catch(
      err => Promise.reject(err)
    )
  }
}

const fetchMessages = channelId => {
  const query = `
    SELECT a.id, a.channelId, a.userId, a.content, a.timeStamp, a.isNotification, b.username, c.id AS profilePicId FROM msg_chats a LEFT JOIN users b ON a.userId = b.id LEFT JOIN users_photos c ON
    a.userId = c.userId AND c.isProfilePic = '1'
    WHERE channelId = ? ORDER BY id DESC LIMIT 21
  `
  return poolQuery(query, channelId).then(
    messages => Promise.resolve(messages)
  )
}

const fetchChannels = (user) => {
  return fetchChannelInfos().then(
    channelInfos => fetchBasicChannelData(channelInfos)
  ).then(
    rows => fetchChannelTitlesAndLastMessages(rows)
  ).then(
    channels => Promise.resolve(channels)
  ).catch(
    err => Promise.reject(err)
  )

  function fetchChannelInfos() {
    return poolQuery('SELECT channelId, lastRead, isHidden FROM msg_channel_info WHERE userId = ?', user.id)
  }

  function fetchBasicChannelData(channelInfos) {
    const query = [
      'SELECT a.id, a.twoPeople, a.channelName FROM msg_channels a WHERE a.id IN ',
      '(SELECT b.channelId FROM msg_channel_members b WHERE b.channelId = ? ',
      'OR b.userId = ?)'
    ].join('')
    return poolQuery(query, [generalChatId, user.id]).then(
      channels => {
        let taskArray = []
        for (let i = 0; i < channels.length; i++) {
          taskArray.push(fetchUserSpecificChannelData(channels[i], channelInfos, user.id))
        }
        return Promise.all(taskArray).then(
          unreads => Promise.resolve(channels.map((channel, index) => {
            return Object.assign(channel, unreads[index])
          }))
        )
      }
    )
  }

  function fetchChannelTitlesAndLastMessages(rows) {
    let taskArray = []
    for (let i = 0; i < rows.length; i++) {
      taskArray.push(fetchChannelTitleAndLastMessage(rows[i], user.id))
    }
    return Promise.all(taskArray).then(
      results => {
        let channels = rows.map((row, index) => {
          return {
            id: row.id,
            channelName: results[index][1] ? results[index][1] : row.channelName,
            lastMessage: results[index][0].content || '',
            lastUpdate: results[index][0].timeStamp || '',
            lastMessageSender: {username: results[index][0].username, id: results[index][0].userId},
            numUnreads: Number(row.numUnreads),
            isHidden: row.isHidden
          }
        })
        channels.sort(function(a, b) { return b.lastUpdate - a.lastUpdate })
        return Promise.resolve(channels)
      }
    )
  }
}

const fetchUserSpecificChannelData = (channel, channelInfos, userId) => {
  const channelId = channel.id
  let lastReadTime = 0
  let isHidden = false
  for (let i = 0; i < channelInfos.length; i++) {
    if (channelInfos[i].channelId === channelId) {
      lastReadTime = channelInfos[i].lastRead
      isHidden = Boolean(channelInfos[i].isHidden)
    }
  }
  let query = 'SELECT COUNT(*) AS numUnreads FROM msg_chats WHERE channelId = ? AND timeStamp > ? AND userId != ?'
  return poolQuery(query, [channelId, lastReadTime, userId]).then(
    rows => Promise.resolve({numUnreads: rows[0].numUnreads, isHidden})
  )
}

const fetchChannelTitleAndLastMessage = (channel, userId) => {
  return Promise.all([fetchLastMessage(), fetchChannelTitle()])

  function fetchLastMessage() {
    const query = [
      'SELECT a.content, a.userId, a.timeStamp, b.username ',
      'FROM msg_chats a JOIN users b ',
      'ON a.userId = b.id ',
      'WHERE channelId = ? ORDER BY a.timeStamp DESC LIMIT 1'
    ].join('')
    return poolQuery(query, channel.id).then(
      rows => Promise.resolve(rows[0] || {})
    )
  }

  function fetchChannelTitle() {
    let generateTitle = channel.twoPeople ?
      generateTitleForBidirectionalChannel : generateTitleForGroupChannel
    return generateTitle(channel.id, userId)
  }
}

const generateTitleForBidirectionalChannel = (channelId, userId) => {
  const query = [
    'SELECT b.userId, c.username ',
    'FROM msg_channels a ',
    'JOIN msg_channel_members b ON ',
    'a.id = b.channelId ',
    'JOIN users c ON ',
    'b.userId = c.id ',
    'WHERE a.id = ? AND a.twoPeople = 1'
  ].join('')
  return poolQuery(query, channelId).then(
    rows => {
      const title = rows.length > 0 ? generateTitle(rows) : null
      return Promise.resolve(title)
    }
  )

  function generateTitle(rows) {
    let partnerName = ''
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].userId !== userId) {
        partnerName = rows[i].username
      }
    }
    return partnerName
  }
}

const generateTitleForGroupChannel = (channelId, userId, callback) => {
  const query = 'SELECT channelName FROM msg_channel_info WHERE userId = ? AND channelId = ?'
  return poolQuery(query, [userId, channelId]).then(
    rows => {
      if (!rows || rows.length === 0) return Promise.resolve(null)
      return Promise.resolve(rows[0].channelName)
    }
  )
}

const saveChannelMembers = (channelId, members) => {
  let tasks = members.map(userId => poolQuery('INSERT INTO msg_channel_members SET ?', {channelId, userId}))
  return Promise.all(tasks)
}

const updateLastRead = ({users, channelId, timeStamp}, callback) => {
  let tasks = users.map(user => {
    let userId = user.id
    let query = 'SELECT COUNT(*) AS num FROM msg_channel_info WHERE userId = ? AND channelId = ?'
    return poolQuery(query, [userId, channelId]).then(
      rows => {
        if (Number(rows[0].num) > 0) {
          let query = 'UPDATE msg_channel_info SET ? WHERE userId = ? AND channelId = ?'
          return poolQuery(query, [{lastRead: timeStamp}, userId, channelId])
        } else {
          return poolQuery('INSERT INTO msg_channel_info SET ?', {userId, channelId, lastRead: timeStamp})
        }
      }
    )
  })
  tasks.push(poolQuery('UPDATE msg_channel_info SET ? WHERE channelId = ?', [{isHidden: false}, channelId]))
  return Promise.all(tasks)
}

module.exports = {
  fetchChat,
  fetchMessages,
  fetchChannels,
  saveChannelMembers,
  updateLastRead
}
