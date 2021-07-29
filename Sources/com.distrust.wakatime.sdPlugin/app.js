/* global $CC, Utils, $SD */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected() {
    $SD.on('com.distrust.wakatime.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
}

const action = {
    settings: {},

    onWillAppear: function (jsn) {
        this.settings = jsn.payload.settings;

        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings.mynameinput = 'WAKATIME';
        }
        this.setTitle(jsn);
    },

    setTitle: function (jsn) {
        if (this.settings && this.settings.hasOwnProperty('mynameinput')) {
            $SD.api.setTitle(jsn.context, this.settings.mynameinput);
        }
    },
};

