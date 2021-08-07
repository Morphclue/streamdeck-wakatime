let websocket = null;
let uuid = null;

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inPropertyInspectorUUID;
    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = () => registerPlugin(inRegisterEvent, inPropertyInspectorUUID);
    websocket.onmessage = (event) => handleMessage(event);
}

function registerPlugin(inRegisterEvent, inPropertyInspectorUUID) {
    let json = {
        "event": inRegisterEvent,
        "uuid": inPropertyInspectorUUID
    };
    websocket.send(JSON.stringify(json));

    json = {
        "event": "getGlobalSettings",
        "context": uuid,
    };
    websocket.send(JSON.stringify(json));
}

function handleMessage(event) {
    const eventObject = JSON.parse(event.data);
    console.log(eventObject);

    switch (eventObject['event']) {
        case 'didReceiveGlobalSettings':
            console.log('Did receive global settings.')
            reloadProperties(eventObject);
            break
        default:
            console.log('Unknown Event')
            break
    }
}

function reloadProperties(eventObject) {
    const payloadSettings = eventObject.payload.settings;

    if (document.getElementById('username').value === "undefined") {
        document.getElementById('username').value = "";
    }
    if (document.getElementById('minutes').value === "undefined") {
        document.getElementById('minutes').value = "";
    }
    if (document.getElementById('apikey').value === "undefined") {
        document.getElementById('apikey').value = "";
    }

    document.getElementById('username').value = payloadSettings.username;
    document.getElementById('minutes').value = payloadSettings.minutes;
    document.getElementById('apikey').value = payloadSettings.apikey;
}

function refreshButtonOnClick() {
    let payload = {};
    payload.username = document.getElementById('username').value;
    payload.minutes = document.getElementById('minutes').value;
    payload.apikey = document.getElementById('apikey').value;

    const json = {
        "event": "setGlobalSettings",
        "context": uuid,
        "payload": payload
    }

    websocket.send(JSON.stringify(json));
    console.log(json);
}
