const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const { validateToken } = require('../middleware/auth');
const middy = require('@middy/core');
const db = new AWS.DynamoDB.DocumentClient();

const updateTodo = async (event, context) => {
  try {
    if (event?.error && event?.error === '401') {
      return sendResponse(401, { success: false, message: 'Invalid Token' });
    }

    const todoId = event.pathParameters.id;
    const userId = event.id;

    // Kolla om todoId har angivits
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

    // Kontrollera om användaren äger den aktuella todo
    if (getTodoResult.Item.userId !== userId) {
      return sendResponse(403, { success: false, message: 'Unauthorized: You cannot update this Todo.' });
    }

    const requestBody = JSON.parse(event.body);

    // Kontrollera om det finns några ändringar att uppdatera
    if (Object.keys(requestBody).length > 0) {
      
      const updatedTodo = {
        ...getTodoResult.Item,
        ...requestBody,
        modifiedAt: new Date().toISOString(),
      };

      
      await db.put({
        TableName: 'todos-db',
        Item: updatedTodo,
      }).promise();

      return sendResponse(200, { success: true, todo: updatedTodo, message: 'Todo updated successfully.' });
    } else {
      return sendResponse(200, { success: false, message: 'No changes to update.' });
    }
  } catch (error) {
    console.error('Error updating Todo:', error);

    return sendResponse(500, { success: false, message: 'Error updating Todo.' });
  }
};

const handler = middy(updateTodo)
  .use(validateToken);

module.exports = { handler };
