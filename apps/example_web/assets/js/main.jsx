import * as React from 'react';
import {useState, useRef, useEffect} from 'react';
import * as ReactDOM from 'react-dom/client';
import { useChannel } from './use_channel';
import { PhoenixSocketProvider } from './phoenix_socket_context';
import * as jsondiffpatch from "rfc6902";

const Form = ({state, changed, clientVersion, serverVersion}) => {
  const [optimistic, setOptimistic] = useState({value: state.input_text});
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) {
      if (clientVersion <= serverVersion + 1 ) {
        setOptimistic({value: state.input_text})
      }
    } else {
      didMountRef.current = true;
    }
  }, [serverVersion]);

  const setValue = (value) => {
    setOptimistic({value: value})
    changed(value)
  }

  return (
    <div className="App">
      <label>Enter some text:</label>
      <textarea onChange={(e) => setValue(e.target.value)} value={optimistic.value}></textarea>
    </div>
  );
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

  const onFormChanged = (value) => {
    setClientVersion((clientVersion) => clientVersion + 2);
    channel.push("input_text", {value: value, version: clientVersion});
  }

  return(
    <div>
      { appState && <Form changed={onFormChanged} state={appState} clientVersion={clientVersion} serverVersion={serverVersion} />}
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

