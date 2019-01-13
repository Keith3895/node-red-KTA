var validator = require('validator');
var utils = require('../utils');



var clear_status = utils.clear_status;
var remove_slash = utils.remove_slash;
var format_values = utils.format_values;
var showMessage = utils.showMessage;
var ntlm = require('request-ntlm-continued');
module.exports = function (RED) {
    function KTAsaveNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var tlsNode = RED.nodes.getNode(config.tls);
        // node
        node.on('input', function (msg) {
            clear_status(node)
            format_values(config)
            let sessionId = msg.sessionId || config.sessionId;
            let NodeId = msg.NodeId || config.NodeId;
            let EmbeddedProcessCount = typeof msg.EmbeddedProcessCount != 'undefined' ? msg.EmbeddedProcessCount : config.EmbeddedProcessCount;
            let JobId = msg.JobId || config.JobId;
            let ActivityName = msg.ActivityName || config.ActivityName;
            let url = msg.url || config.url;
            let ntlmPassword = msg.ntlmPassword || config.ntlmPassword;
            let ntlmUsername = msg.ntlmUsername || config.ntlmUsername;
            let ntlmDomain = msg.ntlmDomain || config.ntlmDomain;
            let ntlmWorkstation = msg.ntlmWorkstation || config.ntlmWorkstation;
            url = remove_slash(url);
            url = `${url}/TotalAgility/Services/Sdk/ActivityService.svc/json/SaveActivity`;
            let ntlmOptions = {
                password: ntlmPassword,
                username: ntlmUsername,
                ntlm_domain: ntlmDomain,
                workstation: ntlmWorkstation,
                url: url
            };
            let body = {
                "sessionId": sessionId,
                "jobActivityIdentity": {
                    "NodeId": NodeId,
                    "EmbeddedProcessCount": EmbeddedProcessCount,
                    "JobId": JobId,
                    "SubNodeId": 0,
                    "Automatic": false,
                    "ActivityName": ActivityName
                },
                "jobActivityOutput": {
                    "OutputVariables": msg.OutputVariables || null,
                    "SetTime": null,
                    "Cost": null
                }
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
        });
    }

    RED.nodes.registerType('KTA-save', KTAsaveNode);
}