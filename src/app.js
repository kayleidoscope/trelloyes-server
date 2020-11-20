require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const { restart } = require('nodemon')
const winston = require('winston');

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';


// set up winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'info.log' })
    ]
});
  
if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
}

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

const cards = [{
    id: 1,
    title: 'Task One',
    content: 'This is card one'
}];

const lists = [{
    id: 1,
    header: 'List One',
    cardIds: [1]
}];

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app