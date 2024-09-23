const UserModel = require('../model/user');
checkDuplicate = async (req, res, next) => {
    try {
        // Username
        const existingUserByUsername = await UserModel.findOne({
            username: req.body.username
        });

        if (existingUserByUsername) {
            return res.status(400).send({ status: 'Failure', statusCode: 400, message: "Failed! Username is already in use!" });
        }

        // Email
        const existingUserByEmail = await UserModel.findOne({
            email: req.body.email
        });

        if (existingUserByEmail) {
            return res.status(400).send({ status: 'Failure', statusCode: 400, message: "Failed! Email is already in use!" });
        }
        //Mobile
        const existingUserByMobile = await UserModel.findOne({
            mobile: req.body.mobile
        });

        if (existingUserByMobile) {
            return res.status(400).send({ status: 'Failure', statusCode: 400, message: "Failed! Mobile number is already in use!" });
        }
        next();
    } catch (err) {
        res.status(500).send({ status: 'Failure', statusCode: 500, message: err.message });
    }
}
const checkDuplicateusernameoremail = { checkDuplicate };
module.exports = checkDuplicateusernameoremail;