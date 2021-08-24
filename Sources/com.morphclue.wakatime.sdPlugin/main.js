let websocket = null;
let pluginUUID = null;
let settings = null;
let titleContext = null;
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
            titleContext = eventObject.context;
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
        "context": titleContext,
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
    let reason;
    if (event.code === 1000) {
        reason = 'Normal Closure. The purpose for which the connection was established has been fulfilled.';
    } else if (event.code === 1001) {
        reason = 'Going Away. An endpoint is "going away", ' +
            'such as a server going down or a browser having navigated away from a page.';
    } else if (event.code === 1002) {
        reason = 'Protocol error. An endpoint is terminating the connection due to a protocol error';
    } else if (event.code === 1003) {
        reason = "Unsupported Data. An endpoint received a type of data it doesn't support.";
    } else if (event.code === 1004) {
        reason = '--Reserved--. The specific meaning might be defined in the future.';
    } else if (event.code === 1005) {
        reason = 'No Status. No status code was actually present.';
    } else if (event.code === 1006) {
        reason = 'Abnormal Closure. ' +
            'The connection was closed abnormally, e.g., without sending or receiving a Close control frame';
    } else if (event.code === 1007) {
        reason = 'Invalid frame payload data. ' +
            'The connection was closed, because the received data was not consistent with the type of the message.';
    } else if (event.code === 1008) {
        reason = 'Policy Violation. The connection was closed, because current message data "violates its policy". ';
    } else if (event.code === 1009) {
        reason = 'Message Too Big. Connection closed because the message is too big for it to process.';
    } else if (event.code === 1010) {
        reason = 'Mandatory Ext. Connection is terminated the connection because the server didn\'t ' +
            'negotiate one or more extensions in the WebSocket handshake.' + event.reason;
    } else if (event.code === 1011) {
        reason = 'Internal Server Error. Connection closed because it encountered an unexpected ' +
            'condition that prevented it from fulfilling the request.';
    } else if (event.code === 1015) {
        reason = 'TLS Handshake. The connection was closed due to a failure to perform a TLS handshake';
    } else {
        reason = 'Unknown reason';
    }
    return reason;
}
