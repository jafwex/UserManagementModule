require('dotenv').config();
const mongoose = require("mongoose");
const dbConnection = process.env.DB_CONNECTION;
const dbName = process.env.DB_NAME;  
const connectionUri = `${dbConnection}`;
mongoose.connect(connectionUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connected Successfully!!",dbName);    
}).catch(err => {
    console.log('', err);
    process.exit();
});
