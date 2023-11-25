const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    const todo = JSON.parse(event.body);

   try {
   await db.put({
        TableName: 'todos-db',
        Item: todo
    }).promise();

    return sendResponse(200, {success: true, todo});
   } catch (error) {

    return sendResponse(500, {success: false, message: "Something went wrong when posting a Todo", error});
   }

}