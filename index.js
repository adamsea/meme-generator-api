// DynamoDB ORM config
const dynogels = require('dynogels');
dynogels.AWS.config.update({
    region: 'us-east-1'
});

// DynamoDB Models
const Joi = require('joi');
let Meme = dynogels.define('Meme', {
    hashKey: 'id',

    // add the timestamp attributes (updatedAt, createdAt)
    timestamps: true,

    schema: {
        id: dynogels.types.uuid(),
        title: Joi.string(),
        src: Joi.string().uri()
    }
});
let Image = dynogels.define('Image', {
    hashKey: 'id',

    // add the timestamp attributes (updatedAt, createdAt)
    timestamps: true,

    schema: {
        id: dynogels.types.uuid(),
        title: Joi.string(),
        src: Joi.string().uri()
    }
});

// Express config
const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.send('Hello World!')
});

module.exports.handler = serverless(app);