let websocket = null;
let uuid = null;

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inPropertyInspectorUUID;
    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = () => registerPlugin(inRegisterEvent, inPropertyInspectorUUID);
    websocket.onmessage = (event) => handleMessage(event);
}

function registerPlugin(inRegisterEvent, inPropertyInspectorUUID)
{
    let json = {
        "event": inRegisterEvent,
        "uuid": inPropertyInspectorUUID
    };
    websocket.send(JSON.stringify(json));

    json = {
        "event": "getSettings",
        "context": uuid,
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
        case 'didReceiveSettings':
            console.log('Did receive settings.')
            // TODO handle payload
            break
        case 'didReceiveGlobalSettings':
            console.log('Did receive global settings.')
            // TODO handle payload
            break
        default:
            console.log('Unknown Event')
            break
    }
}

function refreshButtonOnClick() {
    // TODO handle refreshButtonClick
}