import { useSelector, useDispatch } from "react-redux";
import React from "react";

import AudioCtxContext from "audioCtxContext";

// Action Creators
import {
  onStateLoad,
  onReset,
  onStartStopButtonClick
} from "actionCreators";

// Components
import SaveButton from "components/saveButton";
import LoadButton from "components/loadButton";
import Button from "components/button";

import { buttonColor, darkGrey } from "theme/variables";
import { labelGreyLarge } from "theme/mixins";
import { MODE_PATTERN_CLEAR } from "store-constants";

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
  const [starting, setStarting] = React.useState(false);
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

  const start = async onPlaybackStart => {
    setStarting(true);
    requestInit();
    loopCountRef.current = 0;
    lastStepRef.current = null;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      alert("This browser does not support tab recording.");
      setStarting(false);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true,
        preferCurrentTab: true
      });

      currentStreamRef.current = stream;
      onPlaybackStart();

      const audioCtx = getAudioContext();
      if (!audioCtx) {
        throw new Error("Audio context is unavailable.");
      }

      const finalNode = await new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const findOutputNode = () => {
          const node = getOutputNode();
          if (node) {
            resolve(node);
          } else if (Date.now() - startedAt >= 2000) {
            reject(new Error("Sequencer output did not initialize."));
          } else {
            window.setTimeout(findOutputNode, 25);
          }
        };
        findOutputNode();
      });

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
      return true;
    } catch (error) {
      console.error("Tab recording failed:", error);
      alert("Recording was cancelled or blocked by the browser.");
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        currentStreamRef.current = null;
      }
      if (currentDestRef.current) {
        const finalNode = getOutputNode();
        if (finalNode) {
          const outputNode = finalNode.output || finalNode;
          try {
            outputNode.disconnect(currentDestRef.current);
          } catch (disconnectError) {
            // The node may already have been disconnected.
          }
        }
      }
      currentDestRef.current = null;
      return false;
    } finally {
      setStarting(false);
    }
  };

  return { start, stop, recording, starting };
}

export function RecorderButton() {
  const { start, stop, recording, starting } = useTabRecorder();
  const playing = useSelector(state => state.playing);
  const selectedMode = useSelector(state => state.selectedMode);
  const dispatch = useDispatch();
  const startedPlaybackRef = React.useRef(false);
  const wasRecordingRef = React.useRef(false);

  React.useEffect(() => {
    if (recording) {
      wasRecordingRef.current = true;
      return;
    }

    if (wasRecordingRef.current) {
      wasRecordingRef.current = false;
      if (startedPlaybackRef.current && playing) {
        dispatch(onStartStopButtonClick());
        startedPlaybackRef.current = false;
      }
    }
  }, [dispatch, playing, recording]);

  const handlePress = () => {
    if (recording) {
      stop();
      if (playing) {
        dispatch(onStartStopButtonClick());
      }
      startedPlaybackRef.current = false;
      return;
    }

    startedPlaybackRef.current = false;
    start(() => {
      if (!playing) {
        dispatch(onStartStopButtonClick());
        startedPlaybackRef.current = true;
      }
    }).then(started => {
      if (!started && startedPlaybackRef.current) {
        dispatch(onStartStopButtonClick());
        startedPlaybackRef.current = false;
      }
    });
  };

  return (
    <Button
      disabled={starting || (!recording && selectedMode === MODE_PATTERN_CLEAR)}
      onClick={handlePress}
      style={{
        ...labelGreyLarge,
        color: darkGrey,
        width: "auto",
        height: 35,
        padding: "0 10px",
        borderRadius: 4,
        backgroundColor: buttonColor,
        marginLeft: 5,
        marginRight: 5,
        whiteSpace: "nowrap"
      }}
    >
      {starting ? "Starting..." : recording ? "Stop" : "Play & Record"}
    </Button>
  );
}
