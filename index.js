const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.static('build')) // Tehtävä 3.11
app.use(express.json())
app.use(cors())

// Tehtävä 3.7
//app.use(morgan('tiny'))
// Tehtävä 3.8
const postaus = ':method :url :status :res[content-length] - :response-time ms :post-data'
const muut = ':method :url :status :res[content-length] - :response-time ms'
morgan.token('post-data', (request, response) => {
    if (request.method === 'POST') {
        const { id, ...rest } = request.body
        return JSON.stringify(rest)
    }
})

app.use(morgan((tokens, request, response) => {
    if (request.method === 'POST') {
        return morgan.compile(postaus)(tokens, request, response)
    } else {
        return morgan.compile(muut)(tokens, request, response)
    }
}))

// Tehtävä 3.1
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-532345"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-34-234543"
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-654321"
  }
]

// Tehtävä 3.2
app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p></p><p>${new Date()}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// Tehtävä 3.3
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// Tehtävä 3.4
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

// Tehtävä 3.5-3.6
app.post('/api/persons', (request, response) => {
  const id = Math.floor(Math.random() * 10000)
  const newPerson = request.body
  console.log(newPerson)
  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({error: 'content missing'})
  }
  const personExists = persons.some(person => person.name === newPerson.name)
  if (personExists) {
    return response.status(400).json({ error: 'name is already in list' });
  }
  newPerson.id = id
  persons = persons.concat(newPerson)
  response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})