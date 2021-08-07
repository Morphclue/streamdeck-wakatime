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
    sendGlobalSettings();
}

function sendGlobalSettings() {
    let payload = {};
    payload.username = document.getElementById('username').value;
    payload.apikey = document.getElementById('apikey').value;
    payload.minutes = document.getElementById('minutes').value;

    const json = {
        "event": "setGlobalSettings",
        "context": uuid,
        "payload": payload
    };

    websocket.send(JSON.stringify(json));
    fetchWakaTimeStats(payload.username, payload.apikey, payload.minutes);
}

function fetchWakaTimeStats(username, apikey, minutes) {
    fetch(`https://wakatime.com/api/v1/users/${username}/durations?date=today`, {
        headers: new Headers({
            'Authorization': 'Basic ' + btoa(apikey),
        })
    }).then(response => {
        return response.json();
    }).then(data => {
        let payload = {};
        payload.remaining = calculateRemainingMinutes(data.data, minutes);
        sendToPlugin(payload);
    }).catch(error => {
        console.log(error);
    });
}

function calculateRemainingMinutes(durations, minutesToReach) {
    let workedSeconds = 0;
    for (const value of durations) {
        workedSeconds += value.duration;
    }

    return minutesToReach - Math.floor(workedSeconds / 60);
}

function sendToPlugin(payload) {
    const json = {
        "action": "com.distrust.wakatime.action",
        "event": "sendToPlugin",
        "context": uuid,
        "payload": payload
    };

    websocket.send(JSON.stringify(json));
}