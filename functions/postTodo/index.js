const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { sendResponse } = require('../../responses/index');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
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

module.exports = { handler: exports.handler };
