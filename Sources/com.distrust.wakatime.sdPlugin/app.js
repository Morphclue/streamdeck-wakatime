/* global $CC, Utils, $SD */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected() {
    $SD.on('com.distrust.wakatime.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
}

const action = {
    settings: {},

    /**
     * This event will fire, right before the app will be shown on the Stream Deck.
     * @param jsn This JSONObject contains the plugin's context.
     */
    onWillAppear: function (jsn) {
        this.settings = jsn.payload.settings;

        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings.appname = 'WAKATIME';
        }
        this.setTitle(jsn);
    },

    /**
     * This method changes the title depending on the value stored in the appname-key.
     * @param jsn This JSONObject contains the plugin's context.
     */
    setTitle: function (jsn) {
        if (this.settings && this.settings.hasOwnProperty('appname')) {
            $SD.api.setTitle(jsn.context, this.settings.appname);
        }
    },
};

