const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

  try {
    const todoId = event.pathParameters.id;

    // Kolla om någon ID är angiven
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

    //Annars detta felmedelande
    if (!getTodoResult.Item) {
      return sendResponse(404, { success: false, message: 'Todo not found.' });
    }

    // Parsa inkommande data från event body
    const requestBody = JSON.parse(event.body);

    // Uppdatera Todo-fält
    const updatedTodo = {
      ...getTodoResult.Item, 
      ...requestBody, 
      modifiedAt: new Date().toISOString(), // Nytt timestamp för ändringen
    };

    // Om alla kraven är uppfyllda, uppdatera Todo i DynamoDB
    await db.put({
      TableName: 'todos-db',
      Item: updatedTodo,
    }).promise();

    return sendResponse(200, { success: true, todo: updatedTodo, message: 'Todo updated successfully.' });
  } catch (error) {
    console.error('Error updating Todo:', error);

    return sendResponse(500, { success: false, message: 'Error updating Todo.' });
  }
};
