import { useSelector, useDispatch } from "react-redux";
import React from "react";

import AudioCtxContext from "audioCtxContext";

// Action Creators
import { onStateLoad, onReset } from "actionCreators";

// Components
import SaveButton from "components/saveButton";
import LoadButton from "components/loadButton";
import Button from "components/button";

import { buttonColor, darkGrey } from "theme/variables";
import { labelGreyLarge } from "theme/mixins";

export const ConnectedSaveButton = props => {
  const storeState = useSelector(state => state);
  return <SaveButton storeState={storeState} {...props} />;
};

export const ConnectedLoadButton = props => {
  const playing = useSelector(state => state.playing);

  const dispatch = useDispatch();
  const onLoadedState = React.useCallback(
    loadedState => dispatch(onStateLoad(loadedState)),
    [dispatch]
  );

  return (
    <LoadButton {...props} playing={playing} onLoadedState={onLoadedState} />
  );
};

export const ConnectedResetButton = props => {
  const disabled = useSelector(state => state.playing);

  const dispatch = useDispatch();
  const onClick = React.useCallback(() => {
    if (confirm("Are you sure you want to reset your sequencer?")) {
      dispatch(onReset());
    }
  }, [dispatch]);

  const { size, ...rest } = props;

  return (
    <Button
      {...rest}
      style={{
        ...labelGreyLarge,
        color: darkGrey,
        width: "auto",
        height: size,
        padding: 7,
        borderRadius: 4,
        backgroundColor: buttonColor,
        marginLeft: 5,
        marginRight: 5,
        display: "flex",
        alignItems: "center",
        cursor: "pointer"
      }}
      onClick={onClick}
      disabled={disabled}
    >
      Reset
    </Button>
  );
};

export function useTabRecorder() {
  const mediaRecorder = React.useRef(null);
  const chunks = React.useRef([]);
  const currentDestRef = React.useRef(null);
  const currentStreamRef = React.useRef(null);
  const loopCountRef = React.useRef(0);
  const lastStepRef = React.useRef(null);
  const [recording, setRecording] = React.useState(false);
  const { getAudioContext, getOutputNode, requestInit } = React.useContext(
    AudioCtxContext
  );
  const currentStep = useSelector(state => state.currentStep);

  const stop = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  };

  React.useEffect(() => {
    if (!recording || lastStepRef.current == null) {
      if (recording) {
        lastStepRef.current = currentStep;
      }
      return;
    }

    if (currentStep === 0 && lastStepRef.current !== 0) {
      loopCountRef.current += 1;
      if (loopCountRef.current >= 5) {
        stop();
      }
    }

    lastStepRef.current = currentStep;
  }, [recording, currentStep]);

  const start = async () => {
    requestInit();
    loopCountRef.current = 0;
    lastStepRef.current = null;

    const audioCtx = getAudioContext();
    const finalNode = getOutputNode();

    if (!audioCtx || !finalNode) {
      alert("Start the sequencer before recording.");
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      alert("This browser does not support tab recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true,
        preferCurrentTab: true
      });

      currentStreamRef.current = stream;

      const dest = audioCtx.createMediaStreamDestination();
      currentDestRef.current = dest;

      const outputNode = finalNode.output || finalNode;
      if (currentDestRef.current && outputNode) {
        outputNode.connect(dest);
      }

      const combined = new MediaStream([
        ...stream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const recorder = new MediaRecorder(combined);
      chunks.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "tab-recording.webm";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        if (currentStreamRef.current) {
          currentStreamRef.current.getTracks().forEach(track => track.stop());
          currentStreamRef.current = null;
        }

        if (currentDestRef.current && finalNode) {
          const outputNode = finalNode.output || finalNode;
          try {
            outputNode.disconnect(currentDestRef.current);
          } catch (err) {
            // ignore disconnect errors when the node was already disconnected
          }
          currentDestRef.current = null;
        }

        loopCountRef.current = 0;
        lastStepRef.current = null;
        mediaRecorder.current = null;
        setRecording(false);
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setRecording(true);
    } catch (error) {
      console.error("Tab recording failed:", error);
      alert("Recording was cancelled or blocked by the browser.");
    }
  };

  return { start, stop, recording };
}

export function RecorderButton() {
  const { start, stop, recording } = useTabRecorder();

  return (
    <button onClick={recording ? stop : start}>
      {recording ? "Stop" : "Record"}
    </button>
  );
}
