import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import { useStateChannel } from './state_channel_react';

export const OptimisticInput = ({onChange, value, ...props}) => {
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
    <input ref={inputRef} onChange={(e) => handleChange(e)} value={optimisticValue} {...props} />
  )
}

