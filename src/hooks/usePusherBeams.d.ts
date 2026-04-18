declare module '../hooks/usePusherBeams' {
  const usePusherBeams: () => {
    isSupported: boolean;
    isSubscribed: boolean;
    error: string | null;
    deviceId: string | null;
  };
  export default usePusherBeams;
}