export class AuthenticationError extends Error {
    public statusCode: number;
    
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError'; 
      this.statusCode = 401;
      Object.setPrototypeOf(this, AuthenticationError.prototype); 
    }
  }
  