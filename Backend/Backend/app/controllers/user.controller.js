const UserModel = require('../model/user');
const genericService = require('../service/generic.service.js');
const { encryptData, decryptData } = require('../middlewares/encryption.js');
const securePassword = require('../middlewares/securePassword.js');
const { userSchema,passwordValidation } = require('../../validator/validator.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

//Create user
exports.createUser = async (req, res) => {
    try {
        const existingUser = await UserModel.findOne({ username: req.body.username });
        if (existingUser) {
            res.status(409).send({ status: 'Failure', statusCode: 409, error: "Username already exists" });
        }
        else {
            const decryptedPassword = decryptData(req.body.password);
            const { error } = userSchema.validate({ ...req.body, password: decryptedPassword, confirmPassword: decryptedPassword });
            if (error) {
                return res.status(400).send({ status: 'Failure', statusCode: 400, error: error.details[0].message });
            } else {
                if (req.body.password !== req.body.confirmPassword) {
                    return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Password & Confirm Password does not match!' });
                }
                else {
                    const hashedPassword = await securePassword(decryptedPassword);
                    const user = {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        username: req.body.username,
                        mobile: req.body.mobile,
                        password: hashedPassword,
                        confirmPassword: hashedPassword,
                        address1: req.body.address1,
                        address2: req.body.address2,
                        status: req.body.status,
                        role: req.body.role,
                    };
                    if (req.file) {
                        user.profileImage = req.file.path;
                    } else {
                        user.profileImage = ''
                    }
                    await genericService.create(UserModel, user);
                    return res.status(201).send({ status: 'Success', statusCode: 201, message: "User created successfully!!" });
                }
            }
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}

// Retrieve all User from the database.
exports.getAllUser = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const limitValue = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'username';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const status = req.query.status;
        const role = req.query.role;
        const username = req.query.username;
        const regexOptions = 'i'; // Declare $regex as a string variable with the desired options
        const regex = new RegExp(searchQuery, regexOptions); // Create a regex object with the options
        const query = {
            $or: [
                { username: regex },
                { firstName: regex },
                { lastName: regex },
                { role: regex },
                { status: regex },
                { email: regex },
                { mobile: regex },
            ]
        };
        if (status) {
            query.status = new RegExp(status);
        }
        if (role) {
            query.role = new RegExp(role, regexOptions);
        }
        if (username) {
            query.username = new RegExp(username, regexOptions);
        }
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;
        const totalCount = await UserModel.countDocuments(query);
        const nextPageCount = Math.max(0, totalCount - endIndex);
        const totalPages = Math.ceil(totalCount / limitValue);
        const users = await UserModel.find(query)
            .sort(sortBy)
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        const currentPageCount = users.length;
        res.status(200).send({
            status: 'Success', statusCode: 200, message: 'Users Details Fetched Successfully',
            totalCount, currentPageCount, nextPageCount,
            totalPages, currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
            users
        });
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}
//currentUser profile
exports.currentUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'User not found' });
        } else {
            const userData = {
                "userId": user._id,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "username": user.username,
                "mobileCountryCode": user.mobileCountryCode,
                "mobile": user.mobile,
                "profileImage": user.profileImage,
                "address1": user.address1,
                "address2": user.address2,
                "status": user.status,
                "role": user.role
            }
            return res.status(200).send({ status: 'Success', statusCode: 200, message: 'User Details Fetched Successfully!', userData });
        }
    } catch {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}

// Find a single User with an id
exports.getUserById = async (req, res) => {
    try {
        const user = await genericService.getById(UserModel, req.params.id);
        if (!user) {
            res.status(404).send({ status: 'Failure', statusCode: 404, message: "User not found" });
        } else {
            const userData = {
                "_id": user._id,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "username": user.username,
                "mobileCountryCode": user.mobileCountryCode,
                "mobile": user.mobile,
                "profileImage": user.profileImage,
                "address1": user.address1,
                "address2": user.address2,
                "status": user.status,
                "role": user.role
            }
            res.send({
                status: 'Success',
                statusCode: 200,
                message: "User Details fetched sucessfully",
                data: userData
            });
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
};

// Update a User by the id in the request
exports.updateUserbyId = async (req, res) => {
    try {
        if (!req.body) {
            res.status(400).send({ status: 'Failure', statusCode: 400, message: "Data to update can not be empty!" });
        }
        const id = req.params.id;
        if (req.file) {
            req.body.profileImage = req.file.path
        }
        const { error } = userSchema.validate(req.body); // Use the common Joi schema
        if (error) {
            return res.status(400).send({ status: 'Failure', statusCode: 400, error: error.details[0].message });
        }
        else {
            const updatedUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                username: req.body.username,
                mobile: req.body.mobile,
                profileImage: req.body.profileImage,
                address1: req.body.address1,
                address2: req.body.address2,
                role: req.body.role,
                status: req.body.status,
            }
            await genericService.update(UserModel, id, updatedUser).then(data => {
                if (!data) {
                    res.status(404).send({ status: 'Failure', statusCode: 404, message: 'User not found' });
                } else {
                    res.status(200).send({ status: 'Success', statusCode: 200, message: "User updated successfully" })
                }
            })
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
};

// Update a User status by id in the request
exports.updateStatusUser = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;
        const updatedUser = await genericService.updateStatus(UserModel, id, status);
        if (!updatedUser) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'User not found' });
        } else {
            return res.status(200).send({ status: 'Success', statusCode: 200, message: 'User status updated successfully!' });
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
};

// Delete a User with the specified id in the request
exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteUser = await genericService.getById(UserModel, id);
        if (!deleteUser) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'User not found' });
        } else {
            let imagePath = path.join(deleteUser.profileImage);
            imagePath = '';
            await deleteUser.save();
            await UserModel.findOneAndRemove(id);
            return res.status(200).send({ status: 'Success', statusCode: 200, message: 'User deleted successfully' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
};

// Delete a profileImage with the specified id in the request
exports.deleteImage = async (req, res) => {
    try {
        const id = req.params.id;
        const existingUser = await genericService.getById(UserModel, id);
        if (!existingUser) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: "User Not Found" });
        }
        else {
            if (existingUser.profileImage) {
                const imagePath = path.join(existingUser.profileImage);
                fs.unlinkSync(imagePath);
                existingUser.profileImage = '';
                existingUser.save();
                return res.status(200).send({ status: 'Success', statusCode: 200, message: "ProfileImage deleted successfully" });
            } else {
                existingUser.profileImage = '';
                existingUser.save();
                return res.status(200).send({ status: 'Success', statusCode: 200, message: "ProfileImage deleted successfully" });
            }
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
};

//change password
exports.changePassword = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'User not found' })
        } else {
            const oldPassword = decryptData(req.body.oldPassword);
            const newPassword = decryptData(req.body.newPassword);
            const confirmPassword = decryptData(req.body.confirmPassword);
            const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Old password is incorrect' });
            } else {
                const { error } = passwordValidation.validate({ newPassword: newPassword, confirmPassword: confirmPassword });
                if (error) {
                    return res.status(400).send({ status: 'Failure', statusCode: 400, error: error.details[0].message });
                } else {
                    if(oldPassword !== newPassword) {
                        if (newPassword !== confirmPassword) {
                            return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'New password and confirm password do not match' });
                        } 
                        const hashedNewPassword = await securePassword(newPassword);
                        user.password = hashedNewPassword;
                        await user.save();
                        return res.status(200).send({ status: 'Success', statusCode: 200, message: 'Password was updated successfully' });
                    } else {
                        return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Old password should not same as new password!' });
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
};

//encrypt data
exports.encrypt = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const encryptedName = encryptData(email);
    const encryptedPassword = encryptData(password);
    res.send({ encryptedName, encryptedPassword, message: "encrypted successfully" });
}

//decrypt data
exports.decrypt = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const decryptedName = decryptData(email);
    const decryptedPassword = decryptData(password);
    res.send({ decryptedName, decryptedPassword, message: "decrypted successfully" });
};
