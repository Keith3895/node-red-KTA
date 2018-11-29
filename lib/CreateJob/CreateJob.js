var validator = require('validator');
var utils = require('../utils');



var clear_status = utils.clear_status;
var remove_slash = utils.remove_slash;
var format_values = utils.format_values;
var showMessage = utils.showMessage;
var ntlm = require('request-ntlm-continued');
module.exports = function (RED) {
    function KTACreateJobNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var tlsNode = RED.nodes.getNode(config.tls);
        // node
        node.on('input', function (msg) {
            clear_status(node)
            format_values(config)
            let url = msg.url || config.url;
            let content_type = msg.content_type || config.content_type;
            let ntlmPassword = msg.ntlmPassword || config.ntlmPassword;
            let ntlmUsername = msg.ntlmUsername || config.ntlmUsername;
            let ntlmDomain = msg.ntlmDomain || config.ntlmDomain;
            let ntlmWorkstation = msg.ntlmWorkstation || config.ntlmWorkstation;
            let processId = msg.processId || config.processId;
            let sessionId = msg.sessionId || config.sessionId;
            let processVersion = msg.processVersion || config.processVersion;
            let processName = msg.processName || config.processName;
            let withFile = typeof msg.withFile != 'undefined' ? msg.withFile : config.withFile;
            let fileType = msg.fileType || config.fileType;
            url = remove_slash(url);
            let body = {
                "processIdentity": {
                    "Id": processId,
                    "Version": processVersion,
                    "Name": processName
                },
                "sessionId": sessionId
            };
            node.warn('withFile: ' + withFile);
            if (withFile) {
                if (validator.isEmpty(fileType)) {
                    showMessage(500, 'fileType not specified', err, 'error', err, msg, node);
                    return;
                }
                let jobWithDocsInitialization = {
                    "jobWithDocsInitialization": {
                        "InputVariables": msg.InputVariables || null,
                        "RuntimeDocumentCollection": [
                            {
                                "Base64Data": null, //alternate to passing 'Data'
                                "Data": null, //required byte array, JS Array i.e. [
                                "DeleteDocument": false,
                                "DocumentGroup": null,
                                "DocumentTypeId": null,
                                "DocumentTypeName": null,
                                "FieldsToReturn": [], //RunTimefieldIdentityCollection   
                                "FilePath": null, //alternate to passing 'Data' (serverSide Path)   
                                "FolderId": null,
                                "FolderTypeId": null,
                                "MimeType": fileType, //required   
                                "PageDataList": [], // PageDataCollection   
                                "PageImages": [], // PageImageDataCollection   
                                "ReturnAllFields": true,
                                "RuntimeFields": [] // RuntimeFieldcollection   
                            }
                        ],
                        "StartDate": null
                    }
                };
                url = `${url}/TotalAgility/Services/Sdk/JobService.svc/json/CreateJobWithDocumentsAndProgress2`;
                if (Buffer.isBuffer(msg.payload)) {
                    msg.payload = Buffer.from(msg.payload).toString('base64');
                    jobWithDocsInitialization.jobWithDocsInitialization.RuntimeDocumentCollection[0].Base64Data = msg.payload;
                    body = Object.assign(body, jobWithDocsInitialization);
                } else if (msg.filePath) {
                    jobWithDocsInitialization.jobWithDocsInitialization.RuntimeDocumentCollection[0].FilePath = msg.filePath;
                    body = Object.assign(body, jobWithDocsInitialization);
                }else{
                    showMessage(500, 'File Not Found.', err, 'error', err, msg, node);
                    return;
                }
            } else {
                url = `${url}/TotalAgility/Services/Sdk/JobService.svc/json/CreateJob`;
            }
            let ntlmOptions = {
                password: ntlmPassword,
                username: ntlmUsername,
                ntlm_domain: ntlmDomain,
                workstation: ntlmWorkstation,
                url: url
            };
            ntlm.post(ntlmOptions, body, (err, res) => {
                if (err)
                    showMessage(500, 'Internal server error', err, 'error', err, msg, node);
                else {
                    msg.payload = res.body;
                    msg.authorization = res.request.headers.Authorization;
                    showMessage(res.statusCode, res.statusMessage, msg.payload, 'success', false, msg, node);
                }
            });
            // Object.keys(ntlm).forEach(el => {
            //     if (!validator.isEmpty(ntlm[el])) {
            //     } else {
            // showMessage(500, 'Internal server error', 'Please check authorisation and url'
            //     , 'error', 'Please check authorisation and url', msg, node);
            //     }
            // })


        });
    }

    RED.nodes.registerType('KTA-createJob', KTACreateJobNode);
}