const NewsletterModel = require('../model/newsletter');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const emailConfig = require('../middlewares/emailConfig.js');
const genericService = require('../service/generic.service.js');

exports.subscribeNewsLetter = async (req, res) => {
    try {
        const { email } = req.body;
        const existingSubscriber = await NewsletterModel.findOne({ email });
        if (existingSubscriber) {
            return res.status(409).send({ status: 'Failure', statusCode:409, message: 'Email is already subscribed to the newsletter.' });
        } else {
            const newsletterSubscriber = await NewsletterModel({ email });
            newsletterSubscriber.save();
            const emailTemplatePath = path.join(__dirname, '..', '..', 'htmlTemplate', 'emailTemplates', 'subscribeTemplate.html');
            const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
            const imgPath = path.join(__dirname, '..', '..', 'assets', 'public', 'email', 'newsletter.png');
            const transporter = nodemailer.createTransport(emailConfig);
            const emailSent = await transporter.sendMail({
                from: process.env.EMAIL,
                to: email,
                cc: email,
                bcc: process.env.BCC_EMAIL,
                subject: 'Newsletter Subscription Confirmation',
                attachments: [{
                    filename: 'newsletter.png',
                    path: imgPath,
                    cid: 'img'
                }],
                html: emailTemplate
            });
            return res.status(201).send({ status: 'Success', statusCode:201, message: 'Subscribed to the newsletter successfully.' });
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode:500, message: 'Unable to complete the subscription!' });
    }
}

//getbyId from the newsletter
exports.subscribeNewsLetterbyId = async (req, res) => {
    try {
        const id = req.params.id;
        const subscriber = await genericService.getById(id, NewsletterModel);
        if (!subscriber) {
            res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Subscriber not found' });
        } else {
            res.send({
                status:'Success',
                statusCode: 200,
                message: "Subscriber Details fetched sucessfully",
                data: subscriber
            });
        }
    } catch (error) {
        res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}
// Unsubscribe from the newsletter
exports.unsubscribeNewsLetter = async (req, res) => {
    const { email } = req.body;
    const newsletterSubscriber = await NewsletterModel.findOne({ email });
    if (!newsletterSubscriber) {
        return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'This Email is not subscribed to the newsletter.' });
    } else {
        await NewsletterModel.findOneAndRemove({ email });
        return res.send({
            status: 'Success',
            statusCode: 200,
            message: 'Unsubscribed from the newsletter successfully!'
        });
    }
}

// getAll subscribers details from the newsletter
exports.getAllsubscribeNewsLetter = async (req, res) => {
    try {
        const limitValue = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'email';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;  
        const email = req.query.email;
        const query = {};
        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;
        const totalCount = await NewsletterModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limitValue); 
        const nextPageCount = Math.max(0, totalCount - endIndex); // Calculate the count of records on the next page
        const subscribers = await NewsletterModel.find(query)
            .sort(sortBy)
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        const currentPageCount = subscribers.length;
        return res.status(200).send({
            statusCode: 200,
            message: 'Subscribers data fetched successfully',
            totalCount, 
            currentPageCount, 
            nextPageCount,
            totalPages: totalPages,
            currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
            data: subscribers,
        });
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}
