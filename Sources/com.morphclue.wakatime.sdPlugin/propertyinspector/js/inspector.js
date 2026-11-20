let websocket = null;
let inspectorUUID = null;
let actionUUID = null;
let actionContext = null;

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
    inspectorUUID = inPropertyInspectorUUID;
    actionUUID = inActionInfo.action;
    actionContext = inActionInfo.context;
    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = () => registerPlugin(inRegisterEvent, inPropertyInspectorUUID);
    websocket.onmessage = (event) => handleMessage(event);
}


function handleMessage(event) {
    const eventObject = JSON.parse(event.data);

    switch (eventObject['event']) {
        case 'didReceiveGlobalSettings':
            console.log('Did receive global settings.');
            reloadProperties(eventObject);
            break;
        default:
            console.log('Unknown Event: ' + eventObject.event);
            break;
    }
}

function registerPlugin(inRegisterEvent, inPropertyInspectorUUID) {
    let json = {
        "event": inRegisterEvent,
        "uuid": inPropertyInspectorUUID
    };
    websocket.send(JSON.stringify(json));

    json = {
        "event": "getGlobalSettings",
        "context": inspectorUUID,
    };
    websocket.send(JSON.stringify(json));
}

function reloadProperties(eventObject) {
    const payloadSettings = eventObject.payload.settings;

    document.getElementById('token').value = payloadSettings.token || "";
    document.getElementById('minutes').value = payloadSettings.minutes || "";
}

function refreshButtonOnClick() {
    setGlobalSettings();
}

function setGlobalSettings() {
    let payload = {};
    payload.token = document.getElementById('token').value;
    payload.minutes = document.getElementById('minutes').value;

    const json = {
        "event": "setGlobalSettings",
        "context": inspectorUUID,
        "payload": payload
    };

    websocket.send(JSON.stringify(json));
    sendToPlugin(payload);
}

function sendToPlugin(payload) {
    const json = {
        "action": actionUUID,
        "event": "sendToPlugin",
        "context": actionContext,
        "payload": payload
    };

    websocket.send(JSON.stringify(json));
}