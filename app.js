/* Database config */

require('dotenv').config();
mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).
  catch(err => console.log(err))

mongoose.connection.on('error', err => {
  logError(err)
})

/* Model config */

const { Schema } = mongoose;
const { ObjectId } = Schema

const userSchema = new Schema({
  username: {type: String, required: true}
})

const exerciseSchema = new Schema({
  userId: {type: ObjectId, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: Date
})

const User = mongoose.model('User', userSchema, 'users')
const Exercise = mongoose.model('Exercise', exerciseSchema, 'exercises')

/* Model methods */

// Users

const createAndSaveUser = username => {
  let user = new User({username: username})
  return user.save()
}

const findUserById = userId => User.findById({ _id: userId }).exec()

const showAllUsers = () => User.find().exec()

const checkUsername = async username => {
  const takenUsername = await User.findOne({ username: username })
  if (takenUsername) return true
  return false
}

const formatUser = full_object => finalResponse = { _id: full_object._id, username: full_object.username }

// Exercises

const createAndSaveExercise = (userId, desc, duration, date) => {
  let exercise = new Exercise({
    userId: userId,
    description: desc,
    duration: duration,
    date: date
  })
  return exercise.save()
}

const formatExercise = async full_object => {
  const userObject = await findUserById(full_object.userId)
  const username = userObject.username
  return finalResponse = {
    _id: full_object.userId,
    username: username,
    date: full_object.date.toDateString(),
    duration: full_object.duration,
    description: full_object.description
  }
}

const createUserLog = (userId, to, from, limit) => {
  to = to ? to : new Date(8640000000000000)
  from = from ? from : new Date(-8640000000000000)

  const query = Exercise.find({ userId: userId, date: { $gte: from, $lte: to } }).select('-userId')

  if (limit) return query.limit(limit)
  return query
}

const mapLog = log => {
  return log.map(exer => {
    return {
      description: exer.description,
      duration: exer.duration,
      date: exer.date.toDateString(),
    }
  })
}

const formatLog = async (log, userId) => {
  const userObject = await findUserById(userId)
  const username = userObject.username
  const count = log.length

  return finalResponse = {
    _id: userId,
    username: username,
    count: count,
    log: mapLog(log)
  }
}

/* Exports */

exports.createAndSaveUser = createAndSaveUser
exports.showAllUsers = showAllUsers
exports.checkUsername = checkUsername
exports.formatUser = formatUser
exports.createAndSaveExercise = createAndSaveExercise
exports.formatExercise = formatExercise
exports.createUserLog = createUserLog
exports.formatLog = formatLog
