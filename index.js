require('dotenv').config() // ympäristömuuttuja
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person') // Tehtävä 3.13 tietokanta

app.use(cors())
app.use(express.json())
app.use(express.static('build')) // Tehtävä 3.11

// Tehtävä 3.7
//app.use(morgan('tiny'))
// Tehtävä 3.8
const postaus = ':method :url :status :res[content-length] - :response-time ms :post-data'
const muut = ':method :url :status :res[content-length] - :response-time ms'
morgan.token('post-data', (request, response) => {
  console.log(response)
  if (request.method === 'POST') {
    // eslint-disable-next-line no-unused-vars
    const { id, ...rest } = request.body // id ei käytössä
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

// Tehtävä 3.16
const errorHandler = (error, request, response, next) => {
  //console.error(error.message)
  console.error(error.name)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
  //return response.status(500).json({ error: error.message }) // korjaus virheiden näyttämiseen
}

// Tehtävä 3.13: nimet tietokannasta
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Tehtävä 3.14: lisää nimi tietokantaan
app.post('/api/persons', (request, response, next) => {
  const newPerson = request.body
  console.log(newPerson)
  /* Poistettu tehtävässä 3.19
  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({error: 'content missing'})
  } */
  const person = new Person({
    name: newPerson.name,
    number: newPerson.number
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error)) // Tehtävä 3.19: nimi ja numerokenttien validointi
})

// Tehtävä 3.17: päivitä numero
app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const newNumber = request.body.number
  console.log(newNumber)
  Person.findByIdAndUpdate(id, { number: newNumber }, { new: true, runValidators: true, context: 'query' }) // runValidators lisäys teht 3.19
    .then(updated => {
      response.json(updated)
    })
    .catch(error => next(error))
})

// Tehtävä 3.15: poisto
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => { // result ei käytössä
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Tehtävä 3.18
app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p></p><p>${new Date()}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  console.log(request.params.id)
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

/* Tehtävä 3.1: kovakoodatut
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
/*
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

// const PORT = process.env.PORT || 3001 // Tehtävä 3.9
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
*/