<?php


namespace App\ApiConfig;


class ApiConfig
{

    private function API_URL()
    {
        return env('API_URL');
    }

    private function FEED_API_URL()
    {
        return env('API_URL_FEEDS');
    }

    private function NOTIFICATION_API_URL()
    {
        return env('API_URL_NOTIFICATION');
    }

    private function API_VERSION()
    {
        return env('API_VERSION');
    }

    private function api($address)
    {
        return $address != null ? $this->API_URL().$this->API_VERSION() . $address : $this->API_URL().$this->API_VERSION();
    }

    private function apiFeeds($address)
    {
        return $address != null ? $this->FEED_API_URL().$this->API_VERSION() . $address : $this->API_URL().$this->API_VERSION();
    }

    private function apiNotification($address)
    {
        return $address != null ? $this->NOTIFICATION_API_URL().$this->API_VERSION() . $address : $this->API_URL().$this->API_VERSION();
    }

    public static function get($address = null)
    {
        $apiConfig =  new ApiConfig();
        return $apiConfig->api($address);
    }

    public static function getFeeds($address = null)
    {
        $apiConfig =  new ApiConfig();
        return $apiConfig->apiFeeds($address);
    }

    public static function getNotifications($address = null)
    {
        $apiConfig =  new ApiConfig();
        return $apiConfig->apiNotification($address);
    }

}
