import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'phoenix';
import * as rfc6902 from "rfc6902";

export const useStateChannel = () => {
  const { channel, state, pushMessage, clientVersion, serverVersion } = useContext(StateChannelContext);
  return { channel, state, pushMessage, clientVersion, serverVersion };
};

export const useChannel = channelName => {
  const [channel, setChannel] = useState();
  const { socket } = useContext(PhoenixSocketContext);

  useEffect(() => {
    const phoenixChannel = socket.channel(channelName);

    phoenixChannel.join().receive('ok', () => {
      console.debug("Joined!")
      setChannel(phoenixChannel);
    });

    // leave the channel when the component unmounts
    return () => {
      phoenixChannel.leave();
    };
  }, []);
  // only connect to the channel once on component mount
  // by passing the empty array as a second arg to useEffect
  
  return [channel];
};

export const StateChannelContext = createContext({ channel: null, state: null, pushMessage: null, clientVersion: null, serverVersion: null });

export const StateChannelProvider = ({ channelName, children }) => {
  const [channel] = useChannel(channelName);
  const [appState, setAppState] = useState();
  const [serverVersion, setServerVersion] = useState(0);
  const [clientVersion, setClientVersion] = useState(1);

  useEffect(() => {
    if (!channel) return;

    const setStateRef = channel.on("set_state", ({state: state, version: version}) => {
      setAppState(state);
      setServerVersion(version);
    });

    const stateDiffRef = channel.on("state_diff", ({diff: diff, version: version}) => {
      setAppState((state) => {
        let newState = {...state};

        rfc6902.applyPatch(newState, diff)
        console.debug(newState)
        return newState;
      });
      setServerVersion(version);
    });
   
    // stop listening to this message before the component unmounts
    return () => {
      channel.off("set_state", setStateRef);
      channel.off("state_diff", stateDiffRef);
    };
  }, [channel]);

  const pushMessage = (key, value) => {
    setClientVersion((clientVersion) => clientVersion + 2);
    channel.push(key, {value: value, version: clientVersion});
  }

  if (!channel) return null;
  if (!appState) return null;

  return (
    <StateChannelContext.Provider value={{ channel, pushMessage, serverVersion, clientVersion, state: appState }}>{children}</StateChannelContext.Provider>
  );
};

export const PhoenixSocketContext = createContext({ socket: null });

export const PhoenixSocketProvider = ({ children, ...props }) => {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const socket = new Socket('/socket', {params: (props.socketParams || {})});
    socket.connect();
    setSocket(socket);
  }, []);

  if (!socket) return null;

  return (
    <PhoenixSocketContext.Provider value={{ socket }}>{children}</PhoenixSocketContext.Provider>
  );
};

