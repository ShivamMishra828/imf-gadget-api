class BaseResponse {
    public success: boolean;
    public message: string;

    constructor(success: boolean, message: string) {
        this.success = success;
        this.message = message;
    }
}

export class SuccessResponse<T> extends BaseResponse {
    data?: T;

    constructor(data?: T, message: string = 'Successfully completed the request') {
        super(true, message);
        this.data = data;
    }
}

export class ErrorResponse<T> extends BaseResponse {
    public error?: T;

    constructor(error?: T, message: string = 'Something went wrong') {
        super(false, message);
        this.error = error;
    }
}
