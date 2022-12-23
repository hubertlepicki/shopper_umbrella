import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import Storex from 'storex'

const useStorex = () => {
  return useContext(StorexContext);
};

const StorexContext = createContext({ store: null, state: null });

const StorexProvider = ({ storeName, children }) => {
  const [store, setStore] = useState();
  const [storeState, setStoreState] = useState();

  useEffect(() => {
    const newStore = new Storex({
      store: storeName,
      params: {},
      subscribe: (state) => {
        setStore(newStore);
        setStoreState({...state});
      },
    })
  }, [storeName]);

  if (!store) return null;
  if (!storeState) return null;


  return (
    <StorexContext.Provider value={{ store: store, state: storeState }}>{children}</StorexContext.Provider>
  );
};

const DebugState = () => {
  const { store, state } = useStorex();

  return(
    <div>
      <h4>Current state is:</h4>
      <pre>
        { JSON.stringify(state, null, 2) }
      </pre>
    </div>
  )
};

const Item = ({item}) => {
  const { store } = useStorex();

  return(
    <li>
      <input type="checkbox" checked={item.purchased} onChange={(e) => store.commit("toggle_purchased", item.id)} />
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
  const {state, store} = useStorex();

  return(<ItemsList list={state.list} />)
};

const NewItem = () => {
  const {state, store} = useStorex();

  const handleTitleChange = (e) => {
    store.commit("new_item_title:changed", e.target.value)
  }

  const handleKeyDown = (e) => {
    if (event.key === 'Enter') {
      e.preventDefault()
      store.commit("new_item_title:changed", e.target.value)
      store.commit("new_item:save")
      e.target.value = "";
    } else if (event.key === 'Escape') {
      e.preventDefault()
      store.commit("toggle_new_item")
    }
  }

  if (state.new_item == null) {
    return(<a href="#" onClick={(e) => { e.preventDefault(); store.commit("toggle_new_item") }}>Add new item</a>);
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
  const {store} = useStorex();

  return(<div>
    <span>
      Seed with
    </span>
    <a href="#" onClick={(e) => { e.preventDefault(); store.commit("seed", "10") }}> 10 items,</a>
    <a href="#" onClick={(e) => { e.preventDefault(); store.commit("seed", "100") }}> 100 items,</a>
    <a href="#" onClick={(e) => { e.preventDefault(); store.commit("seed", "1000") }}> 1000 items,</a>
    <a href="#" onClick={(e) => { e.preventDefault(); store.commit("seed", "10000") }}> or 10000 items.</a>
    <hr/>
  </div>)
}

const Main = () => {
  return(
    <StorexProvider storeName={"ShopperWeb.AppStore"}>
      <Seed />
      <NewItem />
      <hr/>

      <ShoppingList />

      <hr />
      <DebugState/>
    </StorexProvider>
  )
}

window.addEventListener("load", () => {
  const main = document.getElementById("main-storex");
  if (main) {

    const root = ReactDOM.createRoot(main);
    root.render(<Main />)
  }
})

