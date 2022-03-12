const express = require('express')
const { request } = require('http')
const path = require('path')
const { db } = require('./DB')

const PORT = 3000

const server = express()

server.set('view engine', 'hbs')
server.set('views', path.join(__dirname, 'src', 'views'))
server.use(express.urlencoded({ extended: true }))

server.get('/', (req, resp) => {
  const postsQuery = req.query
  let postsForRender = db.posts

  if (postsQuery.limit !== undefined && Number.isNaN(+postsQuery.limit) === false) {
    postsForRender = db.posts.slice(0, postsQuery.limit).reverse()
  } else { db.posts.reverse() }

  resp.render('main', { listOfPosts: postsForRender })
})

server.post('/addressbook', (req, res) => {
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
