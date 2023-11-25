const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { sendResponse } = require('../../responses/index');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    const requestBody = JSON.parse(event.body);

    // Kolla att alla oblikatoriska fält finns 
    if (!requestBody.title || !requestBody.text) {
      return sendResponse(400, { success: false, message: 'Title and text are required fields.' });
    }

    // Skapa en timestamp för createdAt och modifiedAt
    const timestamp = new Date().toISOString();

    // Skapa en Todo-objekt med alla fält
    const todo = {
      id: generateId(),
      title: requestBody.title,
      text: requestBody.text,
      createdAt: timestamp,
      modifiedAt: timestamp,
    };

    await db.put({
      TableName: 'todos-db',
      Item: todo,
    }).promise();

    return sendResponse(201, { success: true, todo });

  } catch (error) {
    console.error('Error creating Todo:', error);
    return sendResponse(500, { success: false, message: 'Internal Server Error' });
  }
};

// Funktion som genererar ett unikt ID
function generateId() {
    return uuidv4();
  }