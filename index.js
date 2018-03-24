// DynamoDB ORM config
const dynogels = require('dynogels');
dynogels.AWS.config.update({
    region: 'us-east-1'
});

// DynamoDB Models
const Joi = require('joi');
let Memes = dynogels.define('Meme', {
    hashKey: 'id',

    // add the timestamp attributes (updatedAt, createdAt)
    timestamps: true,

    schema: {
        id: dynogels.types.uuid(),
        title: Joi.string(),
        src: Joi.string().uri()
    },

    tableName: process.env.MEMES_TABLE
});
let Images = dynogels.define('Image', {
    hashKey: 'id',

    // add the timestamp attributes (updatedAt, createdAt)
    timestamps: true,

    schema: {
        id: dynogels.types.uuid(),
        title: Joi.string(),
        src: Joi.string().uri()
    },

    tableName: process.env.IMAGES_TABLE
});

// Express config
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

// Enable CORS for all methods
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token");
    res.header("Access-Control-Allow-Methods", "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT");
    next();
});

app.get('/', (req, res) => {
    res.send('Hello GDI!')
});

app.get('/images', (req, res) => {
    Images
        .scan()
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            let images = data && data.Items || [];
            return res.json({
                images,
                count: data && data.Count || 0
            });
        });
});

app.get('/memes', (req, res) => {
    Memes
        .scan()
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            let images = data && data.Items || [];
            return res.json({
                images,
                count: data && data.Count || 0
            });
        });
});

module.exports.handler = serverless(app);