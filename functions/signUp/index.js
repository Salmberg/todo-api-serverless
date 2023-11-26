const { nanoid } = require('nanoid');
const { sendResponse } = require('../../responses');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk'); 
const db = new AWS.DynamoDB.DocumentClient();


async function createAccount(username, hashedPassword, userId, firstname, lastname) {

    try {
    await db.put ({
        TableName: 'accountsTodo',
        Item: {
            username: username,
            password: hashedPassword,
            firstname: firstname,
            lastname: lastname, 
            userId: userId,

        }

    }).promise();


    return sendResponse(200, {success: true, userId: userId, message: 'Account created'});

    } catch (error) {   
        console.log(error);
        return sendResponse(500, {success: false, message : 'There was an error creating the account'});
    
    }

}


async function signup(username, password, firstname, lastname) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = nanoid();

        const result = await createAccount(username, hashedPassword, userId, firstname, lastname);
        return result;
    } catch (error) {
        console.error(error);
        return sendResponse(500, { success: false, message: 'There was an error creating the account' });
    }
}




exports.handler = async (event) => {
    const { username, password, firstname, lastname } = JSON.parse(event.body);

    const result =  await signup(username, password, firstname, lastname);

    if (result.success) 
        return sendResponse(200, result);
    else 
        return sendResponse(400, result);
    }
    


