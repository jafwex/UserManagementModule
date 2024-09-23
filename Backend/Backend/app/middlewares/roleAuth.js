const UserModel = require('../model/user.js')
const isAdmin = async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    if (user.role === 'Admin') {
        // res.json({ message: `You have access to this protected route as a ${role}.` });
        next();
    } else {
        res.status(403).json({ status: 'Failure', statusCode: 403, message: 'Access denied! You do not have the required role!' });
    }
}

const isManager = async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    if (user.role === 'Manager') {
        // res.json({ message: `You have access to this protected route as a ${role}.` });
        next();
    } else {
        res.status(403).json({ status: 'Failure', statusCode: 403, message: 'Access denied! You do not have the required role!' });
    }
}

module.exports = { isAdmin, isManager };
