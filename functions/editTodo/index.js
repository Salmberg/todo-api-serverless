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

    // Kolla först om något id har angivits
    if (!todoId) {
      return sendResponse(400, { success: false, message: 'Todo ID is required.' });
    }

    // Hämta befintlig Todo från DynamoDB för att kontrollera om den finns
    const getTodoResult = await db.get({
      TableName: 'todos-db',
      Key: {
        id: todoId,
      },
    }).promise();

    // Om Todo med det ID inte finns
    if (!getTodoResult.Item) {
      return sendResponse(404, { success: false, message: 'Todo not found.' });
    }

    const requestBody = JSON.parse(event.body);

    // Uppdatera modifiedAt endast om det har gjorts några ändringar
    if (Object.keys(requestBody).length > 0) {
      // Uppdatera Todo-fält
      const updatedTodo = {
        ...getTodoResult.Item,
        ...requestBody,
        modifiedAt: new Date().toISOString(),
      };

      // Denna uppdaterar Todo i DynamoDB
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
