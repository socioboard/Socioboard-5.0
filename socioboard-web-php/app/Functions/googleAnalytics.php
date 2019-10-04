<?php

// Load the Google API PHP Client Library.
require_once __DIR__.'/../../vendor/autoload.php';

$analytics = initializeAnalytics();
$profile = getFirstProfileId($analytics);
$results = getResults($analytics, $profile);
// printResults($results);

function initializeAnalytics()
{
    // Creates and returns the Analytics Reporting service object.

    // Use the developers console and download your service account
    // credentials in JSON format. Place them in this directory or
    // change the key file location if necessary.
    $KEY_FILE_LOCATION = __DIR__ .'/../../.google_analytics/service-account-credentials.json';

    // Create and configure a new client object.
    $client = new Google_Client();
    $client->setApplicationName("Hello Analytics Reporting");
    $client->setAuthConfig($KEY_FILE_LOCATION);
    $client->setScopes(['https://www.googleapis.com/auth/analytics.readonly']);
    $analytics = new Google_Service_Analytics($client);

    return $analytics;
}

function getFirstProfileId($analytics) {
    // Get the list of accounts for the authorized user.
    $accounts = $analytics->management_accounts->listManagementAccounts();

    if (count($accounts->getItems()) > 0) {
        $items = $accounts->getItems();
        $firstAccountId = $items[0]->getId();
        $firstAccountName = $items[0]->getName();

        // Get the list of properties for the authorized user.
        $properties = $analytics->management_webproperties
            ->listManagementWebproperties($firstAccountId);

        if (count($properties->getItems()) > 0) {
            $items = $properties->getItems();
            $firstPropertyId = $items[0]->getId();
            $firstPropertyName = $items[0]->getName();

            // Get the list of views (profiles) for the authorized user.
            $profiles = $analytics->management_profiles
                ->listManagementProfiles($firstAccountId, $firstPropertyId);

            if (count($profiles->getItems()) > 0) {
                $items = $profiles->getItems();
                $profileInfo = [];
                $profileName = $items[0]->getName();
                $profileId = $items[0]->getId();

                $profileInfo = [$profileId, $profileName, $firstPropertyName, $firstAccountName];
                return $profileInfo;

            } else {
                throw new Exception('No views (profiles) found for this user.');
            }
        } else {
            throw new Exception('No properties found for this user.');
        }
    } else {
        throw new Exception('No accounts found for this user.');
    }
}

function getResults($analytics, $profileInfo) {

    // Calls the Core Reporting API and queries for the number of sessions, users, new users, average session duration and bounce rate for the last month (main data).

    // Get profile info
    $data1 = array_slice($profileInfo, 1, 2);

    $analyticsViewId    = 'ga:' . $profileInfo[0];
    $startDate = ['7daysAgo', '14daysAgo', '21daysAgo', '28daysAgo'];
    $endDate = ['today', '7daysAgo', '14daysAgo', '21daysAgo'];
    $metrics1 = 'ga:sessions, ga:users, ga:newUsers, ga:avgSessionDuration, ga:bounceRate';
    $metrics2 = 'ga:sessions';

    // Get main data
    for ($i = 0, $size = count($startDate); $i < $size; $i++) {
        $data2[$i] = $analytics->data_ga->get($analyticsViewId, $startDate[$i], $endDate[$i], $metrics1);
    }

    // Get spatial data
    for ($i = 0, $size = count($startDate); $i < $size; $i++) {
        $data3[$i] = $analytics->data_ga->get($analyticsViewId, $startDate[$i], $endDate[$i], $metrics2, array(
            'dimensions'    => 'ga:country',
            'sort'          => '-ga:sessions',
            'max-results'   => '5'
        ));
    }

    // Gather in an array
    $data = [$data1, $data2, $data3];

    // Return variable to controller
    return $data;
}