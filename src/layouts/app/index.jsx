// External Deps
import React from "react";
import useHover from "react-gui/use-hover";

// Theme
import { grey, slightlyDarkerBlack } from "theme/variables";
import { labelGreyLarge, autoCursor } from "theme/mixins";

// Sub-layouts
import TopLeftSection from "layouts/topLeftSection";
import TopRightSection from "layouts/topRightSection";
import BottomSection from "layouts/bottomSection";

// Components
import Octicon from "react-octicon";
import {
  ConnectedSaveButton,
  ConnectedLoadButton,
  ConnectedResetButton,
  RecorderButton
} from "./connectedComponents";
import { ComeBack } from 'components/appTitle';

const GithubLink = () => {
  const ref = React.useRef(null);
  const [hovered, onHoverChange] = React.useState(false);
  useHover(ref, { onHoverChange });
  return (
    <a
      ref={ref}
      style={{
        color: slightlyDarkerBlack,
        opacity: hovered ? 1.0 : 0.75,
        transition: "opacity 0.2s"
      }}
      href="https://github.com/vincentriemer/io-808"
      target="_blank"
      rel="noopener noreferrer"
      title="Github Repo"
    >
      <Octicon name="mark-github" mega />
    </a>
  );
};

// layout constants
const APP_WIDTH = 1400;
const APP_HEIGHT = 800;

const HEADER_HEIGHT = 50;
const FOOTER_HEIGHT = 30;
const LAYOUT_HEIGHT = APP_HEIGHT + HEADER_HEIGHT + FOOTER_HEIGHT;
const VIEWPORT_GUTTER = 16;

const getViewportScale = () =>
  Math.min(
    (window.innerWidth - VIEWPORT_GUTTER * 2) / APP_WIDTH,
    (window.innerHeight - VIEWPORT_GUTTER * 2) / LAYOUT_HEIGHT,
    1
  );

const TOP_BOTTOM_DIVIDER_HEIGHT = 3;
const TOP_HEIGHT = Math.ceil(APP_HEIGHT * 0.64) - TOP_BOTTOM_DIVIDER_HEIGHT * 2;
const BOTTOM_HEIGHT = APP_HEIGHT - TOP_HEIGHT - TOP_BOTTOM_DIVIDER_HEIGHT * 2;

const INSTRUMENT_SEPERATOR_WIDTH = 1;

const TOP_LEFT_WIDTH = Math.ceil(APP_WIDTH * 0.23) - INSTRUMENT_SEPERATOR_WIDTH;
const TOP_RIGHT_WIDTH = APP_WIDTH - TOP_LEFT_WIDTH;

const TOP_HORIZONTAL_SEPERATOR_HEIGHT = TOP_HEIGHT - 10;

const styles = {
  pageWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden"
  },

  wrapper: {
    position: "absolute",
    width: APP_WIDTH,
    height: LAYOUT_HEIGHT,
    top: "50%",
    left: "50%",
    transformOrigin: "center center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  headerWrapper: {
    width: APP_WIDTH,
    height: HEADER_HEIGHT,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  saveLoadClearWrapper: {
    display: "flex",
    flexDirection: "row"
  },

  footerWrapper: {
    width: APP_WIDTH,
    height: FOOTER_HEIGHT,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 10
  },

  appWrapper: {
    width: APP_WIDTH,
    height: APP_HEIGHT,
    display: "flex",
    flexDirection: "column"
  },

  topBottomDivider: {
    width: APP_WIDTH,
    height: TOP_BOTTOM_DIVIDER_HEIGHT,
    backgroundColor: grey
  },

  topHorizontalDivider: {
    width: INSTRUMENT_SEPERATOR_WIDTH,
    height: TOP_HORIZONTAL_SEPERATOR_HEIGHT,
    backgroundColor: grey
  },

  topWrapper: {
    width: APP_WIDTH,
    height: TOP_HEIGHT,
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },

  bottomWrapper: {
    width: APP_WIDTH,
    height: BOTTOM_HEIGHT
  },

  footerText: {
    ...labelGreyLarge,
    ...autoCursor
  },

  blmLink: {
    ...labelGreyLarge,
    position: "relative",
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textDecoration: "underline",
    backgroundColor: "black",
    padding: "10px 15px",
    top: -10
  },

  note: {
    ...labelGreyLarge,
    position: "relative",
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    padding: "10px 15px",
    top: -5
  }
};

const AppLayout = React.memo(
  () => {
    const [viewportScale, setViewportScale] = React.useState(getViewportScale);

    React.useEffect(() => {
      const updateScale = () => setViewportScale(getViewportScale());
      window.addEventListener("resize", updateScale);
      updateScale();
      return () => window.removeEventListener("resize", updateScale);
    }, []);

    const d = new Date();
    const hour = d.getHours();
    const min = d.getMinutes();
    const is808 = (hour == 8 || hour == 20) && min == 8;
    //const is808 = true;
    return is808 ? (
      <div style={styles.pageWrapper}>
        <div
          style={{
            ...styles.wrapper,
            transform: `translate(-50%, -50%) scale(${viewportScale})`
          }}
        >
          <div style={styles.headerWrapper}>
            <div style={styles.saveLoadClearWrapper}>
              <ConnectedLoadButton size={35} />
              <ConnectedSaveButton size={35} />
              <ConnectedResetButton size={35} />
              <RecorderButton/>
            </div>

            <a
              href="https://blacklivesmatters.carrd.co"
              rel="noopener"
              style={styles.blmLink}
              target="_blank"
            >
              #BlackLivesMatter
            </a>
            <GithubLink />
          </div>
          <div style={styles.appWrapper}>
            <div style={styles.topBottomDivider} />
            <div style={styles.topWrapper}>
              <TopLeftSection width={TOP_LEFT_WIDTH} height={TOP_HEIGHT} />
              <div style={styles.topHorizontalDivider} />
              <TopRightSection
                width={TOP_RIGHT_WIDTH}
                height={TOP_HEIGHT}
                seperatorWidth={INSTRUMENT_SEPERATOR_WIDTH}
              />
              <div style={styles.topHorizontalDivider} />
            </div>
            <div style={styles.topBottomDivider} />
            <div style={styles.bottomWrapper}>
              <BottomSection
                width={APP_WIDTH}
                height={BOTTOM_HEIGHT}
                topLeftWidth={TOP_LEFT_WIDTH}
              />
            </div>
          </div>
          <div style={styles.footerWrapper}>
            <div>
              <a style={styles.footerText} href="/tutorial" target="_blank">
                Tutorial
              </a>
            </div>
            <div style={labelGreyLarge}>
              Original sequencer made with <Octicon name="heart" /> by{" "}
              <a
                style={{ color: grey }}
                href="http://vincentriemer.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vincent Riemer
              </a>
              , hacked with <Octicon name="heart" /> by{" "}
              <a
                style={{ color: grey }}
                href="http://miakizz.quest"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mia Kiesman
              </a>
            </div>
            <div>
              <a
                style={styles.footerText}
                href="https://github.com/miakizz/makeabeat/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report an Issue
              </a>
            </div>
          </div>
        </div>
      </div>
    ) : (<ComeBack />);
  },
  () => true
);

export default AppLayout;
