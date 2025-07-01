"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewsletter = createNewsletter;
exports.editNewsletter = editNewsletter;
exports.destroyNewsletter = destroyNewsletter;
exports.muteNewsletter = muteNewsletter;
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
async function createNewsletter(req, res) {
    /**
       * #swagger.tags = ["Newsletter]
          #swagger.operationId = 'createNewsletter'
         #swagger.autoBody=false
         #swagger.security = [{
                "bearerAuth": []
         }]
         #swagger.parameters["session"] = {
          schema: 'NERDWHATS_AMERICA'
         }
         #swagger.requestBody = {
          required: true,
          "@content": {
              "application/json": {
                  schema: {
                      type: "object",
                      properties: {
                          name: { type: "string" },
                          options: { type: "object" },
                      }
                  },
                  examples: {
                      "Create newsletter/channel": {
                          value: {
                              name: 'Name for your channel',
                              options: {
                                  description: 'Description of channel',
                                  picture: '<base64_image>',
                              }
                          }
                      },
                  }
              }
          }
          }
       */
    const session = req.session;
    const { name, options } = req.body;
    try {
        res.status(201).json(await req.client.createNewsletter(name, options));
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function editNewsletter(req, res) {
    /**
         * #swagger.tags = ["Newsletter]
           #swagger.operationId = 'editNewsletter'
           #swagger.autoBody=false
           #swagger.security = [{
                  "bearerAuth": []
           }]
           #swagger.parameters["session"] = {
            schema: 'NERDWHATS_AMERICA'
           }
           #swagger.parameters["id"] = {
            schema: '<newsletter_id>'
           }
           #swagger.requestBody = {
          required: true,
          "@content": {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  picture: { type: "string" },
                }
              },
              examples: {
                "Edit newsletter/channel": {
                  value: {
                      name: 'New name of channel',
                      description: 'New description of channel',
                      picture: '<new_base64_image> or send null',
                  }
                },
                  "Create newsletter/channel": {
                      value: {
                          name: 'Name for your channel',
                          options: {
                              description: 'Description of channel',
                              picture: '<base64_image>',
                          }
                      }
                  },
              }
            }
          }
         }
         */
    const session = req.session;
    const { name, description, picture } = req.body;
    const { id } = req.params;
    try {
        res.status(201).json(await req.client.editNewsletter(id, {
            name,
            description,
            picture,
        }));
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function destroyNewsletter(req, res) {
    /**
   * #swagger.tags = ["Newsletter]
      #swagger.autoBody=false
      #swagger.operationId = 'destroyNewsletter'
      #swagger.security = [{
              "bearerAuth": []
      }]
      #swagger.parameters["session"] = {
          schema: 'NERDWHATS_AMERICA'
      }
      #swagger.parameters["id"] = {
          schema: 'NEWSLETTER ID'
      }
      */
    const session = req.session;
    const { id } = req.params;
    try {
        res.status(201).json(await req.client.destroyNewsletter(id));
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function muteNewsletter(req, res) {
    /**
     * #swagger.tags = ["Newsletter]
       #swagger.operationId = 'muteNewsletter'
       #swagger.autoBody=false
       #swagger.security = [{
                "bearerAuth": []
        }]
        #swagger.parameters["session"] = {
            schema: 'NERDWHATS_AMERICA'
        }
        #swagger.parameters["id"] = {
            schema: 'NEWSLETTER ID'
        }
        */
    const session = req.session;
    const { id } = req.params;
    try {
        res.status(201).json(await req.client.muteNesletter(id));
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
