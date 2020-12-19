require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const createAndSaveUser = require('./app.js').createAndSaveUser
const showAllUsers = require('./app.js').showAllUsers
const checkUsername = require('./app.js').checkUsername
const formatUser = require('./app.js').formatUser
const createAndSaveExercise = require('./app.js').createAndSaveExercise
const createUserLog = require('./app.js').createUserLog
const formatExercise = require('./app.js').formatExercise
const formatLog = require('./app.js').formatLog

app.post('/api/exercise/new-user', async (req, res) => {
  const username = req.body.username
  if (await checkUsername(username)) return res.send('Username already taken')

  const createdUser = await createAndSaveUser(username)
  return res.json(formatUser(createdUser))
})

app.get('/api/exercise/users', async (req, res) => {
  const allUsers = await showAllUsers()
  return res.json(allUsers)
})

app.post('/api/exercise/add', async (req, res) => {
  const userId = req.body.userId
  const desc = req.body.description
  const duration = req.body.duration
  let date = req.body.date
  
  if (!date) {
    date = new Date()
  }
  
  const createdExercise = await createAndSaveExercise(userId, desc, duration, date)

  return res.json(await formatExercise(createdExercise))

})

app.get('/api/exercise/log', async (req, res) => {
  const userId = req.query.userId
  const to = req.query.to
  const from = req.query.from
  const limit = parseInt(req.query.limit)

  const userLog = await createUserLog(userId, to, from, limit)

  return res.json(await formatLog(userLog, userId))

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
