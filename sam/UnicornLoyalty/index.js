let AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
let table = process.env.TABLE_NAME;

exports.handler = (event, context, callback) => {
    let now = Date.now()/1000;
    let expiry = new Date('2018.12.31').getTime()/1000;
    let getParams = {
        TableName: table,
        Key:{
            "userId": event.arguments.userId
        }
    };
    let putParams = {
        TableName:table,
        Item:{
            "userId": event.arguments.userId,
            "username": event.arguments.username,
            "points": 1000
        }
    };
    if (expiry < now){
        putParams.Item.points = 0;
    }
    switch(event.field){
        case "getUser":
            dynamo.get(getParams, function(err,data){
                if (err){
                    console.error("Error JSON: ", JSON.stringify(err,null,2));
                    callback(err);
                } else if (data.Item == undefined) {
                    let result = {
                        "userId": "",
                        "username": "",
                        "points": 1000
                    };
                    callback(null,result);
                } else {
                    console.log("User Exists: ", JSON.stringify(data,null,2));
                    let result = {
                        "userId": data.Item.userId,
                        "username": data.Item.username,
                        "points": data.Item.points
                    };
                    callback(null,result);
                }
            });
            break;
        case "registerUser":
            dynamo.put(putParams, function(err,data){
                if (err){
                    console.error("Error JSON: ", JSON.stringify(err,null,2));
                    callback(err);    
                } else {
                    console.log("User Added: ", JSON.stringify(data,null,2));
                    let result = putParams;
                    callback(null,result);
                }
            });
            break;
        case "updateBalance":
            putParams.Item.points = event.arguments.points;
            dynamo.put(putParams, function(err,data){
                if (err){
                    console.error("Error JSON: ", JSON.stringify(err,null,2));
                    callback(err);    
                } else {
                    console.log("Balance Updated: ", JSON.stringify(data,null,2));
                    let result = {
                        "userId": event.arguments.userId,
                        "username": event.arguments.username,
                        "points": event.arguments.points
                    }
                    callback(null,result);
                }
            });
            break;
        default:
            callback("Unknown field, unable to resolve" + event.field, null);
            break;
    }
};