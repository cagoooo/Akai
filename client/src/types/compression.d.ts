declare module 'compression' {
  import { RequestHandler } from 'express';
  function compression(options?: Record<string, unknown>): RequestHandler;
  export default compression;
}
