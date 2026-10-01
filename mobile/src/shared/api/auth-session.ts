type Listener = () => void;

let token: string | null = null;
let unauthorizedListener: Listener | null = null;

/** Token da sessão em memória, compartilhado entre o cliente HTTP e o AuthProvider. */
export const authSession = {
  token: (): string | null => token,

  setToken(value: string | null): void {
    token = value;
  },

  onUnauthorized(listener: Listener | null): void {
    unauthorizedListener = listener;
  },

  notifyUnauthorized(): void {
    unauthorizedListener?.();
  },
};
