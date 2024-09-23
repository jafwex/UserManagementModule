const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const db = require('./db/connect.js');
const UserRoute = require('./app/routes/user.route.js');
const AuthRoute = require('./app/routes/auth.route.js');
const NewsLetterRoute = require('./app/routes/newsletter.route.js');
const axios = require('axios');
const cors = require('cors');
const corsOptions = {
  origin: process.env.CORSOPTIONS
};
console.log(corsOptions);
app.use(cors(corsOptions));
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/emailTemplates", express.static("emailTemplates"));
app.use('/api/v1/user', UserRoute, AuthRoute);
app.use('/newsletter', NewsLetterRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is listening on port", `${PORT}`);
});

