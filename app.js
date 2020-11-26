require('dotenv').config()
const express = require('express'),
  ejs = require('ejs'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  encrypt = require('mongoose-encryption')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost/usersDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password']
})

const User = mongoose.model('User', userSchema)

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', (req, res) => {
  const userDetails = User({
    email: req.body.username,
    password: req.body.password
  })

  userDetails.save((err) => {
    if (!err) {
      res.render('secrets')
    } else {
      console.log('err occurred')
    }
  })
})

app.post('/login', (req, res) => {
  User.findOne({ email: req.body.username }, (err, found) => {
    if (!err) {
      if (found) {
        if (found.password === req.body.password) {
          res.render('secrets')
        } else {
          res.send('password incorrect')
        }
      } else {
        res.send('user not found')
      }
    } else {
      res.send('err')
    }
  })
})

app.listen(process.env.PORT || 3000, () =>
  console.log('Server is running in port 3000')
)
