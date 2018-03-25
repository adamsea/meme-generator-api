# meme-generator-api

API for sample meme generator application

## Important! Please read before installing.

This API is a set of endpoints access via Lambda and API Gateway. The **node-canvas** library used was built against the current AWS-suggested AMI for Lambda, since running `npm install` locally will simply build the canvas library for your machine, making it unusable in a Lambda context.

#### Creating a "Lambda Compatible" EC2 Instance

Prior to deploying this API with serverless, you must follow the instructions at:

https://github.com/Automattic/node-canvas/wiki/Installation---AWS-Lambda

The `lib/` dependencies are already installed in this repo, but you must re-run `npm install canvas@1.6.10` on the EC2 "Lambda" Instance you create to regenerate the node-canvas library, then do the following:

#### Steps to rebuild node-canvas

1) Remove node_modules/canvas and node_modules/nan
2) Copy the node_modules/canvas and node_modules/nan directories created on the EC2 "Lambda" Instance to this repo
3a) Run `sls deploy -s dev` to deploy the dev stage
3b) Run `sls deploy -s prod` to deploy the prod stage
