import React, { useMemo, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { StateChannelProvider, PhoenixSocketProvider, useStateChannel } from 'state_channel_react';

const DebugState = () => {
  const {state, clientVersionRef, serverVersion } = useStateChannel();

  return(
    <div>
      <h4>Current state is:</h4>
      <pre>
        { JSON.stringify(state, null, 2) }
      </pre>
      <h4>Current serverVersion is: {serverVersion}</h4>
      <h4>Current clientVersion is: {clientVersionRef.current}</h4>
    </div>
  )
};

const Item = ({item}) => {
  const { pushMessage } = useStateChannel();

  return(
    <li>
      <input type="checkbox" checked={item.purchased} onChange={(e) => pushMessage("toggle_purchased", item.id)} />
      {item.title}
    </li>
  )
}

const MemoItem = React.memo(Item)

const ItemsList = ({list}) => {
  const items = list.map((item) =>
    <MemoItem key={item.id} item={item} />
  )

  return(<ul>{items}</ul>)
};

const ShoppingList = () => {
  const {state, pushMessage} = useStateChannel();

  return(<ItemsList list={state.list} />)
};

const NewItem = () => {
  const {state, pushMessage} = useStateChannel();

  const handleTitleChange = (e) => {
    pushMessage("new_item_title:changed", e.target.value)
  }

  const handleKeyDown = (e) => {
    if (event.key === 'Enter') {
      e.preventDefault()
      pushMessage("new_item_title:changed", e.target.value)
      pushMessage("new_item:save")
      e.target.value = "";
    } else if (event.key === 'Escape') {
      e.preventDefault()
      pushMessage("toggle_new_item")
    }
  }

  if (state.new_item == null) {
    return(<a href="#" onClick={(e) => { e.preventDefault(); pushMessage("toggle_new_item") }}>Add new item</a>);
  } else {
    return(
      <div>
        <input type="text" onKeyDown={handleKeyDown} placeholder="New Item..." autoFocus />
        { state.new_item.error  && <div>{state.new_item.error}</div> }
      </div>
    );
  }
}

const Seed = () => {
  const {pushMessage} = useStateChannel();

  return(<div>
    <span>
      Seed with
    </span>
    <a href="#" onClick={(e) => { e.preventDefault(); pushMessage("seed", 10) }}> 10 items,</a>
    <a href="#" onClick={(e) => { e.preventDefault(); pushMessage("seed", 100) }}> 100 items,</a>
    <a href="#" onClick={(e) => { e.preventDefault(); pushMessage("seed", 1000) }}> 1000 items,</a>
    <a href="#" onClick={(e) => { e.preventDefault(); pushMessage("seed", 10000) }}> or 10000 items.</a>
    <hr/>
  </div>)
}

export const Main = () => {
  return(
    <PhoenixSocketProvider>
      <StateChannelProvider topic="app:state">
        <Seed />
        <NewItem />
        <hr/>

        <ShoppingList />

        <hr />
        <DebugState/>
      </StateChannelProvider>
    </PhoenixSocketProvider>
  )
}

window.addEventListener("load", () => {
  const root = ReactDOM.createRoot(document.getElementById("main"));
  root.render(<Main />)
})

