import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom/client';
import { StateChannelProvider, PhoenixSocketProvider, useStateChannel } from './vendor/state_channel_react';

const Form = () => {
  const { state, channel, pushMessage } = useStateChannel();
  return (
    <div>
      <label>Enter some text:</label>
      <OptimisticTextarea onChange={(e) => pushMessage("text_input:changed", e.target.value)} value={state.text_input} />
    </div>
  );
}

const OptimisticTextarea = ({onChange, value}) => {
  const { clientVersion, serverVersion } = useStateChannel();
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

const DebugState = () => {
  const {state, clientVersion, serverVersion } = useStateChannel();

  return(
    <div>
      <h4>Current state is:</h4>
      <pre>
        { JSON.stringify(state) }
      </pre>
      <h4>Current serverVersion is: {serverVersion}</h4>
      <h4>Current clientVersion is: {clientVersion}</h4>
    </div>
  )
};

export const Main = () => {
  return(
    <PhoenixSocketProvider>
      <StateChannelProvider channelName="app:state">
        <Form />
        <DebugState />
      </StateChannelProvider>

    </PhoenixSocketProvider>
  )
}

window.addEventListener("load", () => {
  const root = ReactDOM.createRoot(document.getElementById("main"));
  root.render(<Main />)
})

