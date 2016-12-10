SocioboardApp.service('utility', function (apiDomain) {
    this.getHttpsUrl = function (url) {
        console.log("test"+ url);
        if (url !=null && url.includes("wwwroot\\")) {
            return apiDomain + "/api/Media/get?id=" + url.split("wwwroot\\upload\\")[1];
        }
        else {
            return url;
        }
    }   
});