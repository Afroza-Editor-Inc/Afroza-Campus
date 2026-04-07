declare module 'phoenix' {
  export class Socket {
    constructor(endpoint: string, opts?: any);
    connect(): void;
    channel(topic: string, params?: any): any;
  }
}
