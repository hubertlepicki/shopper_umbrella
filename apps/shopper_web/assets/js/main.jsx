import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StateChannelProvider, PhoenixSocketProvider, useStateChannel } from './vendor/state_channel_react';
import { OptimisticTextarea } from './vendor/optimistic_textarea.jsx';
import { OptimisticInput } from './vendor/optimistic_input.jsx';

const DebugState = () => {
  const {state, clientVersion, serverVersion } = useStateChannel();

  return(
    <div>
      <h4>Current state is:</h4>
      <pre>
        { JSON.stringify(state, null, 2) }
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
        <DebugState />
      </StateChannelProvider>

    </PhoenixSocketProvider>
  )
}

window.addEventListener("load", () => {
  const root = ReactDOM.createRoot(document.getElementById("main"));
  root.render(<Main />)
})

