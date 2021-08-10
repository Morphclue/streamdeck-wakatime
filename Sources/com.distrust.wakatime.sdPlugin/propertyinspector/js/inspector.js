let websocket = null;
let inspectorUUID = null;

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
    inspectorUUID = inPropertyInspectorUUID;
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

    if (document.getElementById('username').value === "undefined") {
        document.getElementById('username').value = "";
    }
    if (document.getElementById('apikey').value === "undefined") {
        document.getElementById('apikey').value = "";
    }
    if (document.getElementById('minutes').value === "undefined") {
        document.getElementById('minutes').value = "";
    }

    document.getElementById('username').value = payloadSettings.username;
    document.getElementById('apikey').value = payloadSettings.apikey;
    document.getElementById('minutes').value = payloadSettings.minutes;
}

function refreshButtonOnClick() {
    setGlobalSettings();
}

function setGlobalSettings() {
    let payload = {};
    payload.username = document.getElementById('username').value;
    payload.apikey = document.getElementById('apikey').value;
    payload.minutes = document.getElementById('minutes').value;

    const json = {
        "event": "setGlobalSettings",
        "context": inspectorUUID,
        "payload": payload
    };

    websocket.send(JSON.stringify(json));
}

function sendToPlugin(payload) {
    const json = {
        "action": "com.distrust.wakatime.action",
        "event": "sendToPlugin",
        "context": inspectorUUID,
        "payload": payload
    };

    websocket.send(JSON.stringify(json));
}