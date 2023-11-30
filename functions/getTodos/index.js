const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const { validateToken } = require('../middleware/auth');
const middy = require('@middy/core');
const db = new AWS.DynamoDB.DocumentClient();

const getTodos = async (event, context) => {
    try {
        if (event?.error && event?.error === '401') {
            return sendResponse(401, { success: false, message: 'Invalid Token' });
        }

        const userId = event.id;

        if (!userId) {
            return sendResponse(400, { success: false, message: 'User ID is required.' });
        }

        const { Items } = await db.scan({
            TableName: 'todos-db',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        }).promise();

        return sendResponse(200, { success: true, todos: Items });
    } catch (error) {
        console.error('Error fetching Todos:', error);
        return sendResponse(500, { success: false, message: 'Error fetching Todos.' });
    }
};

const handler = middy(getTodos)
    .use(validateToken);

module.exports = { handler };
