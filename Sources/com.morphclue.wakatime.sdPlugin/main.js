let websocket = null;
let pluginUUID = null;
let settings = null;
let context = null;
let remainingMinutes = 0;
let timerId;

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    pluginUUID = inPluginUUID;
    websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = () => registerPlugin(inRegisterEvent);
    websocket.onmessage = (event) => handleMessage(event);
    websocket.onerror = (event) => console.warn('Websocket error:', event, event.data);
    websocket.onclose = (event) => unregisterPlugin(event);
}

function handleMessage(event) {
    const eventObject = JSON.parse(event.data);

    switch (eventObject['event']) {
        case 'willAppear':
            console.log('Stream-Deck appeared');
            context = eventObject.context;
            fetchWakaTimeStats();
            break;
        case 'willDisappear':
            console.log('Stream-Deck disappeared');
            break;
        case 'sendToPlugin':
            console.log('Data from PropertyInspector arrived.');
            getGlobalSettings();
            break;
        case 'didReceiveGlobalSettings':
            console.log('Did receive global settings.');
            settings = eventObject.payload.settings;
            fetchWakaTimeStats();
            break;
        case 'keyUp':
            console.log('Pressed keyUp');
            fetchWakaTimeStats();
            break;
        default:
            console.log('Unknown Event: ' + eventObject.event);
            break;
    }
}

function fetchWakaTimeStats() {
    if (!(settings.username && settings.apikey && settings.minutes)) {
        showAlert();
        return;
    }

    fetch(`https://wakatime.com/api/v1/users/${settings.username}/durations?date=today`, {
        headers: new Headers({
            'Authorization': 'Basic ' + btoa(settings.apikey),
        })
    }).then(response => {
        return response.json();
    }).then(data => {
        remainingMinutes = calculateRemainingMinutes(data.data, settings.minutes);
        setTitle(remainingMinutes);
    }).catch(error => {
        console.log(error);
    });
}

function registerPlugin(inRegisterEvent) {
    const json = {
        "event": inRegisterEvent,
        "uuid": pluginUUID
    };

    websocket.send(JSON.stringify(json));

    getGlobalSettings();
    startTimer();
}

function startTimer() {
    timerId = setInterval(function () {
        fetchWakaTimeStats();
    }, 30 * 1000);
}

function showAlert() {
    const json = {
        "event": "showAlert",
        "context": context,
    };

    websocket.send(JSON.stringify(json));
}

function getGlobalSettings() {
    const json = {
        "event": "getGlobalSettings",
        "context": pluginUUID,
    };

    websocket.send(JSON.stringify(json));
}

function unregisterPlugin(event) {
    const reason = getWebsocketReason(event);
    console.warn('Websocket closed:', reason);

    clearInterval(timerId);
}

function setTitle(title) {
    const json = {
        "event": "setTitle",
        "context": context,
        "payload": {
            "title": "" + title,
            "target": 0
        }
    };

    websocket.send(JSON.stringify(json));
}

function calculateRemainingMinutes(durations, minutesToReach) {
    let workedSeconds = 0;
    for (const value of durations) {
        workedSeconds += value.duration;
    }

    const remainingTime = minutesToReach - Math.floor(workedSeconds / 60);
    return remainingTime > 0 ? remainingTime : 0;
}

function getWebsocketReason(event) {
    const reasons = {
        1000: 'Normal Closure. The purpose for which the connection was established has been fulfilled.',
        1001: 'Going Away. An endpoint is "going away", such as a server going down or a browser having navigated away from a page.',
        1002: 'Protocol error. An endpoint is terminating the connection due to a protocol error',
        1003: "Unsupported Data. An endpoint received a type of data it doesn't support.",
        1004: '--Reserved--. The specific meaning might be defined in the future.',
        1005: 'No Status. No status code was actually present.',
        1006: 'Abnormal Closure. The connection was closed abnormally, e.g., without sending or receiving a Close control frame',
        1007: 'Invalid frame payload data. The connection was closed, because the received data was not consistent with the type of the message.',
        1008: 'Policy Violation. The connection was closed, because current message data "violates its policy". ',
        1009: 'Message Too Big. Connection closed because the message is too big for it to process.',
        1010: 'Mandatory Ext. Connection is terminated the connection because the server didn\'t negotiate one or more extensions in the WebSocket handshake.' + event.reason,
        1011: 'Internal Server Error. Connection closed because it encountered an unexpected condition that prevented it from fulfilling the request.',
        1015: 'TLS Handshake. The connection was closed due to a failure to perform a TLS handshake',
    };

    return reasons[event.code] || 'Unknown reason';
}
