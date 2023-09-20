import "./App.css";
import Webcam, { type WebcamProps } from "react-webcam";
import axios from "axios";
import { observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";

const videoConstraints = {
  width: 1024,
  height: 900,
  facingMode: "user",
};

const results = observable<{
  status: "error" | "ok" | "complete" | "ready";
  info: string;
}>({
  status: "error",
  info: "wait...",
});

function App() {
  let run = false;
  const takeSnapshot: WebcamProps["children"] = (({ getScreenshot }: any) => {
    const dosnapshot = async () => {
      const imageSrc = getScreenshot();
      const ret = await axios({
        method: "POST",
        url: "http://localhost:3030/",
        headers: { "Content-Type": "text/plain" },
        data: imageSrc,
      });

      console.info(ret);
      runInAction(() => {
        if (ret.data === "ERR") {
          results.status = "error";
        } else if (ret.data === "READY") {
          results.status = "ready";
        } else if (ret.data === "Complete") {
          results.status = "complete";
        } else if (ret.data === "OK") {
          results.status = "ok";
        } else if (ret.data && ret.data.startsWith("REC")) {
          results.status = "ok";
          results.info = ret.data;
        }
      });
      if (run) {
        dosnapshot();
      }
    };

    return (
      <div className="actions">
        <button
          onClick={() => {
            run = !run;
            if (run) {
              dosnapshot();
            }
          }}
        >
          Start/Stop/Focus
        </button>
        <button onClick={getInfo}>Info</button>
        <button onClick={sendWrite}>Write</button>
        <button onClick={sendCache}>Cache</button>
      </div>
    );
  }) as any;

  const getInfo = async () => {
    const ret = await axios({
      method: "POST",
      url: "http://localhost:3030/info",
      headers: { "Content-Type": "text/plain" },
    });

    runInAction(() => {
      results.info = ret.data;
    });
  };
  const sendWrite = async () => {
    const ret = await axios({
      method: "POST",
      url: "http://localhost:3030/write",
      headers: { "Content-Type": "text/plain" },
    });

    runInAction(() => {
      results.info = ret.data;
    });
  };
  const sendCache = async () => {
    const ret = await axios({
      method: "POST",
      url: "http://localhost:3030/cache",
      headers: { "Content-Type": "text/plain" },
    });

    runInAction(() => {
      results.info = ret.data;
    });
  };

  return (
    <div className="App">
      <Webcam
        audio={false}
        height={300}
        screenshotFormat="image/png"
        screenshotQuality={1}
        width={400}
        videoConstraints={videoConstraints}
      >
        {takeSnapshot}
      </Webcam>
      <Results />
    </div>
  );
}

const Results = observer(() => {
  return <div className={`results ${results.status}`}>{results.info}</div>;
});

export default App;
