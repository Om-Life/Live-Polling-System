import { useEffect, useRef } from 'react';
import { socketManager } from '../utils/socket';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = socketManager.socket;
  }, []);

  const emit = (event, data) => {
    socketManager.emit(event, data);
  };

  const on = (event, callback) => {
    socketManager.on(event, callback);
  };

  const off = (event, callback) => {
    socketManager.off(event, callback);
  };

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    connected: socketRef.current?.connected || false
  };
};

export default useSocket;