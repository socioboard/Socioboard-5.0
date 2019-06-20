
class ResponseLibs {

    constructor() {
        this.Result = {
            SUCCESS: "Success",
            CREATED: "Created",
            BADREQUEST: "BadRequest",
            UNAUTHORIZED: "Unauthorized",
            FORBIDDEN: "Forbidden",
            NOTFOUND: "NotFound",
            UNSUPPORTEDMEDIA: "UnSupportedMedia",
            TOOMANYREQUEST: "TooManyRequest",
            INTERNALSERVERERROR: "InternalServerError",
            NOTIMPLEMENTED: "NotImplemented"
        };

        this.Success = { code: 200, status: "success" };
        this.Created = { code: 201, status: "success" };
        this.BadRequest = { code: 400, status: "failed" };
        this.Unauthorized = { code: 401, status: "failed" };
        this.Forbidden = { code: 403, status: "failed" };
        this.NotFound = { code: 404, status: "failed" };
        this.UnSupportedMedia = { code: 415, status: "failed" };
        this.TooManyRequest = { code: 429, status: "failed" };
        this.InternalServerError = { code: 500, status: "failed" };
        this.NotImplemented = { code: 501, status: "failed" };
    }


    getNewObject(object) {
        return JSON.parse(JSON.stringify(object));
    }

    getResponse(method, message) {   
        let object = {};
        switch (method) {
            case this.Result.SUCCESS:
                object = this.getNewObject(this.Success);
                object.data = message;
                break;
            case this.Result.CREATED:
                object = this.getNewObject(this.Created);
                object.data = message;
                break;
            case this.Result.BADREQUEST:
                object = this.getNewObject(this.BadRequest);
                object.error = message;
                break;
            case this.Result.UNAUTHORIZED:
                object = this.getNewObject(this.Unauthorized);
                object.error = message;
                break;
            case this.Result.FORBIDDEN:
                object = this.getNewObject(this.Forbidden);
                object.error = message;
                break;
            case this.Result.NOTFOUND:
                object = this.getNewObject(this.NotFound);
                object.error = message;
                break;
            case this.Result.UNSUPPORTEDMEDIA:
                object = this.getNewObject(this.UnSupportedMedia);
                object.error = message;
                break;
            case this.Result.TOOMANYREQUEST:
                object = this.getNewObject(this.TooManyRequest);
                object.error = message;
                break;
            case this.Result.INTERNALSERVERERROR:
                object = this.getNewObject(this.InternalServerError);
                object.error = message;
                break;
            case this.Result.NOTIMPLEMENTED:
                object = this.getNewObject(this.NotImplemented);
                object.error = message;
                break;
            default:
                break;
        }
        return object;
    }
}

module.exports = ResponseLibs;