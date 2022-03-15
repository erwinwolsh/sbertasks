const express = require('express')
const { request } = require('http')
const path = require('path')
const hbs = require('hbs')
const cookieParser = require('cookie-parser')
const { sessions } = require('./sessions')
const { checkAuth } = require('./src/middlewares/checkAuth')

const { secondDb } = require('./secondDb')
const { db } = require('./DB')

const server = express()
const PORT = process.env.PORT || 3000



server.set('view engine', 'hbs')
server.set('views', path.join(process.env.PWD, 'src', 'views'))
hbs.registerPartials(path.join(process.env.PWD, 'src', 'views', 'partials'))

//ручка, которая учит принимать сервер данные пользователя
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())

server.get('/', (req, res) => {
  res.render('main')
})

server.get('/secret', checkAuth, (req, res) => {
  res.render('secret')
})

// Query selector параметры и главная страница
server.get('/', (req, resp) => {
  const postsQuery = req.query
  let postsForRender = db.posts

  if (postsQuery.limit !== undefined && Number.isNaN(+postsQuery.limit) === false) {
    postsForRender = db.posts.slice(0, postsQuery.limit)
  }  else if (postsQuery.reverse = true) {
    postsForRender = db.posts.reverse()
  }

  resp.render('main', { listOfPosts: postsForRender })
})

//регистрация
server.get('/auth/signup', (req, res) => {
  res.render('signUp')
})

server.post('/auth/signup', (req, res) => { 
  const { name, email, password } = req.body

  secondDb.users.push({
    name,
    email,
    password,
  })
  
  const sid = Date.now()

  sessions[sid] = {
    email,
  }

  res.cookie('sid', sid, {
    httpOnly: true,
    maxAge: 36e8,
  })
  res.redirect('/')
})

//Авторизация пользователя
server.get('/auth/signin', (req, res) => {
  res.render('signIn')
})

server.post('/auth/signin', (req, res) => {
  const { email, password } = req.body

  const currentUser = secondDb.users.find((user) => user.email === email)

  if (currentUser) {
    if (currentUser.password === password) {
      const sid = Date.now()

      sessions[sid] = {
        email,
      }

      res.cookie('sid', sid, {
        httpOnly: true,
        maxAge: 36e8,
      })

      return res.redirect('/')
    }
  }

  return res.redirect('/auth/signin')
})

//Выход из системы
server.get('/auth/signout', (req, res) => {
  const sidFromUserCookie = req.cookies.sid

  delete sessions[sidFromUserCookie]

  res.clearCookie('sid')
  res.redirect('/')
})

//Публикация записей
server.post('/postlist', (req, res) => {
  const dataFromForm = req.body

  db.posts.push(dataFromForm)

  res.redirect('/')
})

server.get('*', (req, res) => {
  res.render('404')
})

server.listen(PORT, () => {
  console.log(`Server has been started on port: ${PORT}`)
})
