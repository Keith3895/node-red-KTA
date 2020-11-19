var validator = require('validator');
var utils = require('../utils');



var clear_status = utils.clear_status;
var remove_slash = utils.remove_slash;
var format_values = utils.format_values;
var showMessage = utils.showMessage;
var ntlm = require('request-ntlm-continued');
module.exports = function (RED) {
    function KTAactivityPagingNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var tlsNode = RED.nodes.getNode(config.tls);
        // node
        node.on('input', function (msg) {
            clear_status(node)
            format_values(config)
            let sessionId = msg.sessionId || config.sessionId;
            let useDefaultOuery = typeof msg.useDefaultOuery != 'undefined' ? msg.useDefaultOuery : config.useDefaultOuery;
            let resourceId = msg.resourceId || config.resourceId;
            let resourceName = msg.resourceName || config.resourceName;
            let url = msg.url || config.url;
            let ntlmPassword = msg.ntlmPassword || config.ntlmPassword;
            let ntlmUsername = msg.ntlmUsername || config.ntlmUsername;
            let ntlmDomain = msg.ntlmDomain || config.ntlmDomain;
            let ntlmWorkstation = msg.ntlmWorkstation || config.ntlmWorkstation;
            let CaseId = msg.caseId || "";
            let pageSize = msg.pageSize || config.pageSize;
            let PageDirection = msg.pageDirection || config.pageDirection || 0;
            let from = msg.StartDueDateTime || config.StartDueDateTime || null;  // null for first page
            let to = msg.StartPendingTime || config.StartPendingTime || null;    // null for first page


            url = remove_slash(url);
            url = `${url}/TotalAgility/Services/Sdk/ActivityService.svc/json/GetWorkQueueWithQuery2`;
            let ntlmOptions = {
                password: ntlmPassword,
                username: ntlmUsername,
                ntlm_domain: ntlmDomain,
                workstation: ntlmWorkstation,
                url: url
            };
            let body = {
                "sessionId": sessionId,
                "useDefaultQuery": useDefaultOuery,
                "queryIdentity": null,
                "jobActivityFilter": {
                    "AssignedResourceFilter": 1,
                    "NodeId": 0,
                    "LoanResource": {
                        "Id": null,
                        "Name": null,
                        "ResourceType": 0
                    },
                    "EndDueDateTime": null,
                    "StatusFilter": 257,
                    "JobIdsFilter": [],
                    "MaxActivitiesCount": pageSize,
                    "StartDueDateTime": from,
                    "StartPendingTime": to,
                    "ActivityTypeFilters": 0,
                    "WorkQueueDefinition": {
                        "Id": "",
                        "Name": ""
                    },
                    "MetaDataFilter": {
                        "FilterOperator": 0,
                        "Filter": []
                    },
                    "ReturnJobIds": false,
                    "UsePrioritySetting": 0,
                    "PriorityType": 0,
                    "DueDateType": 0,
                    "Priority": 1,
                    "ActivityName": "",
                    "Resource": {
                        "Id": resourceId,
                        "Name": resourceName,
                        "ResourceType": 0
                    },
                    "UseCombinedWorkQueue": false,
                    "UseJobSlaStatus": false,
                    "JobSlaStatus": 0,
                    "JobState": null,
                    "PageDirection": PageDirection,
                    "UseActivitySlaStatus": false,
                    "ActivitySlaStatus": 0,
                    "CaseActivitiesOnly": false,
                    "Process": {
                        "Id": "",
                        "Name": "",
                        "Version": 0
                    },
                    "Case": {
                        "CaseReference": CaseId,//search based on Case ID 
                        "CaseId": ""//JOB ID
                    },
                    "Category": {
                        "Id": null,
                        "Name": null
                    },
                    "ScoreFilter": {
                        "ScoreOperator": 0,
                        "Filter": {}
                    },
                    "DueDateFilterType": 0,
                    "PendingTimeFilter": 0,
                    "GetQueryResultCount": true // returns total number of records
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
    RED.nodes.registerType('KTA-activityPaging', KTAactivityPagingNode);
}
