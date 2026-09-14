const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to add Android Package Visibility queries for Google Maps.
 * Ensures Android 11+ (API 30+) allows checking and launching com.google.android.apps.maps.
 */
function withGoogleMapsQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.queries = manifest.queries || [];

    // Check if Google Maps package query already exists
    const hasMapsPackage = manifest.queries.some(
      (q) => q.package && q.package.some((p) => p.$ && p.$['android:name'] === 'com.google.android.apps.maps')
    );

    if (!hasMapsPackage) {
      manifest.queries.push({
        package: [{ $: { 'android:name': 'com.google.android.apps.maps' } }],
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': 'google.navigation' } }],
          },
        ],
      });
    }

    return config;
  });
}

module.exports = withGoogleMapsQueries;
