class CustomError extends Error {
  public status: number;

  public message: string;

  constructor(status: number, message: string) {
    super(`${message}`);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
