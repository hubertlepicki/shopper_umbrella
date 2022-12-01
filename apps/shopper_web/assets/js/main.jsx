import * as React from 'react';
import {useState, useRef, useEffect, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom/client';
import { useChannel } from './use_channel';
import { PhoenixSocketProvider } from './phoenix_socket_context';
import * as jsondiffpatch from "rfc6902";

const Form = ({state, pushMessage, clientVersion, serverVersion}) => {
  return (
    <div>
      <label>Enter some text:</label>
      <OptimisticTextarea onChange={(e) => pushMessage("text_input:changed", e.target.value)} value={state.text_input} clientVersion={clientVersion} serverVersion={serverVersion} />
    </div>
  );
}

const OptimisticTextarea = ({onChange, value, clientVersion, serverVersion}) => {
  const [optimisticValue, setOptimisticValue] = useState(value);
  const didMountRef = useRef(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const inputRef = useRef(null);


  useEffect(() => {
    if (didMountRef.current) {
      if (clientVersion <= serverVersion + 1 ) {
        setOptimisticValue(value)
      }
    } else {
      didMountRef.current = true;
    }
  }, [serverVersion]);

  useLayoutEffect(() => {
    if (didMountRef.current && inputRef.current && cursorPosition !== null) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, [optimisticValue, serverVersion]);

  const handleChange = (e) => {
    setOptimisticValue(e.target.value);
    setCursorPosition(e.target.selectionStart);
    onChange(e);
  }

  return(
    <textarea ref={inputRef} onChange={(e) => handleChange(e)} value={optimisticValue}></textarea>
  )
}
export const Main = () => {
  const [channel] = useChannel("app:state");
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

        jsondiffpatch.applyPatch(newState, diff)
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

  return(
    <div>
      { appState && <Form pushMessage={pushMessage} state={appState} clientVersion={clientVersion} serverVersion={serverVersion} />}
      <h4>Current appState is:</h4>
      <pre>
        { JSON.stringify(appState) }
      </pre>
      <h4>Current serverVersion is: {serverVersion}</h4>
      <h4>Current clientVersion is: {clientVersion}</h4>
    </div>
  )
}

window.addEventListener("load", () => {
  const root = ReactDOM.createRoot(document.getElementById("main"));
  root.render(<PhoenixSocketProvider><Main /></PhoenixSocketProvider>)
})

