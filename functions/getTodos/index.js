const { sendResponse } = require('../../responses/index');

var todos = [
    { id: 1, text: 'Walk the dog' },
    { id: 2, text: 'Wash the dishes' },
    { id: 3, text: 'Do laundry' }
];




exports.handler = async (event, context) => {

   

    return sendResponse(200, {todos});


}