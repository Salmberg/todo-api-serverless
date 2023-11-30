const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const { validateToken } = require('../middleware/auth');
const middy = require('@middy/core');
const db = new AWS.DynamoDB.DocumentClient();


// Här ska jag kolla om event.username är samma som token.username
const getTodos = async (event, context) => {

    if (event?.error && event?.error === '401')
        return sendResponse(401, {success: false, message: 'Invalid Token'});

    const {Items} = await db.scan({
        TableName: 'todos-db',
        
    }).promise();

        return sendResponse(200, {success: true, todos : Items});
   

}

const handler = middy(getTodos)
    .use(validateToken)



module.exports = {handler};