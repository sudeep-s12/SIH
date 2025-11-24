import { useEffect, useState, useRef } from 'react';

export default function useIoTData(socketUrl) {
  const [iotData, setIotData] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setIotData((prevData) => {
          const updated = [...prevData, data];
          return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
        });
      } catch (e) {
        console.error('Invalid WebSocket message', e);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [socketUrl]);

  return iotData;
}
