const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const db = new AWS.DynamoDB.DocumentClient();

const deleteTodo = async (event, context) => {
  try {
    if (event?.error && event?.error === '401') {
      return sendResponse(401, { success: false, message: 'Invalid Token' });
    }

    const todoId = event.pathParameters.id;

    if (!todoId) {
      return sendResponse(400, { success: false, message: 'Todo ID is required.' });
    }

    // Hämta Todo från DynamoDB för att kontrollera om det finns
    const getTodoResult = await db.get({
      TableName: 'todos-db',
      Key: {
        id: todoId,
      },
    }).promise();

    // Om Todo inte finns, returnera ett felmeddelande
    if (!getTodoResult.Item) {
      return sendResponse(404, { success: false, message: 'Todo not found.' });
    }


    // Om Todo finns och token är giltig, fortsätt med att ta bort det
    await db.delete({
      TableName: 'todos-db',
      Key: {
        id: todoId,
      },
    }).promise();

    return sendResponse(200, { success: true, message: 'Todo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting Todo:', error);

    return sendResponse(500, { success: false, message: 'Error deleting Todo.' });
  }
};

const handler = middy(deleteTodo)
  .use(validateToken);

module.exports = { handler };
