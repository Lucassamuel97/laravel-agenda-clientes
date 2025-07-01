"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinessProfilesProducts = getBusinessProfilesProducts;
exports.getOrderbyMsg = getOrderbyMsg;
function returnSucess(res, session, phone, data) {
    res.status(201).json({
        status: 'Success',
        response: {
            message: 'Information retrieved successfully.',
            contact: phone,
            session: session,
            data: data,
        },
    });
}
function returnError(req, res, session, error) {
    req.logger.error(error);
    res.status(400).json({
        status: 'Error',
        response: {
            message: 'Error retrieving information',
            session: session,
            log: error,
        },
    });
}
async function getBusinessProfilesProducts(req, res) {
    /**
     * #swagger.tags = ["Catalog & Bussiness"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        in: 'query',
        schema: '5521999999999@c.us',
       }
     */
    const session = req.session;
    const { phone } = req.query;
    try {
        const results = [];
        const result = await req.client.getBusinessProfilesProducts(phone);
        results.push(result);
        returnSucess(res, session, phone, results);
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function getOrderbyMsg(req, res) {
    /**
     * #swagger.tags = ["Catalog & Bussiness"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["messageId"] = {
        schema: 'true_5521999999999@c.us_3EB0E69ACC5B396B21F2FE'
       }
     */
    const session = req.session;
    const { messageId } = req.params;
    try {
        const result = await req.client.getOrder(messageId);
        returnSucess(res, session, null, result);
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
