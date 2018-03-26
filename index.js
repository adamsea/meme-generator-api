// DynamoDB ORM and S3 config
const dynogels = require('dynogels');
dynogels.AWS.config.update({
    region: 'us-east-1'
});
const S3 = new dynogels.AWS.S3();

// DynamoDB Models
const Joi = require('joi');
let Memes = dynogels.define('Meme', {
    hashKey: 'id',
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

// Other dependencies
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const memecanvas = require('memecanvas');
memecanvas.init('/tmp', '-meme');

// Enable CORS for all methods
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token");
    res.header("Access-Control-Allow-Methods", "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT");
    next();
});

// Enable POST body support
app.use(bodyParser.json({
    strict: false
}));

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

app.post('/images', (req, res) => {
    let image = req.body.image;
    let name = req.body.name;
    let type = req.body.type;
    if (image && name && type) {
        let uuid = uuidv4();
        let b64 = image.split(',')[1];
        let buf = Buffer.from(b64, 'base64');
        return S3.upload({
                Body: buf,
                Bucket: process.env.IMAGES_BUCKET,
                ContentType: type,
                Key: `${ uuid }-${ name }`
            })
            .promise()
            .then((result) =>
                Images.create({
                    title: result.Key,
                    src: result.Location
                }, (err, newImage) => {
                    if (err) {
                        return res.status(500).json({
                            message: err.message
                        });
                    }
                    return res.json(newImage.get());
                })
            )
            .catch((err) =>
                res.status(500).json({
                    message: err.message
                })
            )
    }
    res.status(500).json({
        message: 'No image was uploaded'
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

app.post('/memes', (req, res) => {
    let src = req.body.src;
    let title = req.body.title;
    let topText = req.body.top_text;
    let bottomText = req.body.bottom_text;
    if (src && title && topText && bottomText) {
        return memecanvas.generate(src, topText, bottomText, (err, filePath) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            return fs.readFile(filePath, (err, buf) => {
                if (err) {
                    return res.status(500).json({
                        message: err.message
                    });
                }
                fs.unlinkSync(filePath);
                let name = filePath.split('/').slice(-1)[0];
                name = `${ Math.floor(100000 + Math.random() * 900000) }-${ name }`;
                return S3.upload({
                        Body: buf,
                        Bucket: process.env.IMAGES_BUCKET,
                        ContentType: 'image/jpeg',
                        Key: name
                    })
                    .promise()
                    .then((result) =>
                        Memes.create({
                            title,
                            src: result.Location
                        }, (err, newMeme) => {
                            if (err) {
                                return res.status(500).json({
                                    message: err.message
                                });
                            }
                            return res.json(newMeme.get());
                        })
                    )
                    .catch((err) =>
                        res.status(500).json({
                            message: err.message
                        })
                    )
            });
        })
    }
    res.status(500).json({
        message: 'Cannot process meme without all data'
    });
});

module.exports.handler = serverless(app);