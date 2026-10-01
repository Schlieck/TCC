export interface DatabaseHealth {
  isReachable(): Promise<boolean>;
}
