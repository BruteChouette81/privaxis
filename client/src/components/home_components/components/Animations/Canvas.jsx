import { useRef, useEffect, useState } from "react";
import { CanvasContext } from "../../hooks/useCanvas";
import useResponsiveSize from "../../hooks/useResponsiveSize";
import Wave from "./Wave";

const Canvas = () => {
  const canvasRef = useRef(null);
  const { width } = useResponsiveSize();
  const [context, setContext] = useState();

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx) setContext(ctx);
  }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: "rgb(243 244 245)",
          overflowX: "hidden",
        }}
      >
        <CanvasContext.Provider value={{ context }}>
          <canvas
            id="canvas"
            ref={canvasRef}
            width={width}
            height={220}
          ></canvas>
          <Wave />
        </CanvasContext.Provider>
      </div>
    </>
  );
};

export default Canvas;
