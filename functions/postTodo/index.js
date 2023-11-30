const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core'); 
const { validateToken } = require('../middleware/auth'); 
const db = new AWS.DynamoDB.DocumentClient();

const postTodo = async (event) => {
  try {
    if (event?.error && event?.error === '401') {
        return sendResponse(401, { success: false, message: 'Invalid Token' });
    }


    const todo = JSON.parse(event.body);

    // Skapa ett unikt ID för den nya todon med uuid
    const newTodoId = uuidv4();

    const currentDate = new Date().toISOString();

    await db.put({
      TableName: 'todos-db',
      Item: {
        id: newTodoId,
        title: todo.title,
        text: todo.text,
        createdAt: currentDate,
        modifiedAt: currentDate,
      },
    }).promise();

    return sendResponse(200, { success: true, message: 'Todo created' });
  } catch (error) {
    console.error('Error creating Todo:', error);

    return sendResponse(500, { success: false, message: 'Error creating Todo.' });
  }
};

const handler = middy(postTodo)
  .use(validateToken);

module.exports = { handler };
