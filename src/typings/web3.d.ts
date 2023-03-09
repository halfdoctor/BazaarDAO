/* eslint-disable @typescript-eslint/no-explicit-any */

interface Window {
  web3: import('web3').default;
  ethereum: {
    isCoinbaseWallet?: boolean;
    isCoinbaseBrowser?: boolean;
    isMetaMask?: boolean;
    isStatus?: boolean;
    host?: string;
    path?: string;
    providers?: typeof window.ethereum[];
    sendAsync: (
      request: { method: string; params?: any[] },
      callback: (error: any, response: any) => void
    ) => void;
    send: (request: { method: string; params?: any[] }, callback: (error: any, response: any) => void) => void;
    request: (request: { method: string; params?: {} }) => Promise<any>;
    on: (request: string, callback: (...args: any[]) => void) => void;
    setSelectedProvider: (provider: typeof window.ethereum) => void;
    isConnected: () => void;
  };
}
