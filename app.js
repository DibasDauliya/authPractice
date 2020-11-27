require('dotenv').config()
const express = require('express'),
  ejs = require('ejs'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  session = require('express-session'),
  passport = require('passport'),
  passportLocalMongoose = require('passport-local-mongoose')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set('view engine', 'ejs')

app.use(
  session({
    secret: 'This is our little secret',
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost/usersDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets')
  } else {
    res.send('not authenticated')
  }
})

app.post('/register', (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        res.send(err)
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/secrets')
        })
      }
    }
  )
})

app.post('/login', (req, res) => {
  const user = User({
    username: req.body.username,
    password: req.body.password
  })

  req.logIn(user, (err) => {
    if (err) {
      res.send(err)
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets')
      })
    }
  })
})

app.listen(process.env.PORT || 3000, () =>
  console.log('Server is running in port 3000')
)
