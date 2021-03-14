import type { FC } from "react";
import { useRef, useEffect, useState } from "react";

import styles from "./App.module.scss";
import imageSrc from "./assets/image.jpg";
import movableSrc from "./assets/1f602.svg";

const App: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const [isLock, setLock] = useState(false);

  useEffect(() => {
    if (canvasRef.current === null) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx === null) throw new Error("Ctx must be non null");

    const image = new Image();
    image.addEventListener(
      "load",
      () => {
        ctx.canvas.width = image.naturalWidth;
        ctx.canvas.height = image.naturalHeight;
      },
      false,
    );
    image.src = imageSrc;

    const movableImage = new Image();
    movableImage.src = movableSrc;

    let positionX = 0;
    let positionY = 0;
    let clickOffsetX = 0;
    let clickOffsetY = 0;
    const width = 600;
    const height = 600;
    let isDragging = false;

    ctx.canvas.addEventListener(
      "mousedown",
      (event) => {
        const rect = ctx.canvas.getBoundingClientRect();
        const mouseX = Math.round(
          (event.clientX - rect.left) * (ctx.canvas.width / rect.width),
        );
        const mouseY = Math.round(
          (event.clientY - rect.top) * (ctx.canvas.height / rect.height),
        );

        if (
          positionX <= mouseX &&
          mouseX <= positionX + width &&
          positionY <= mouseY &&
          mouseY <= positionY + height
        ) {
          clickOffsetX = mouseX - positionX;
          clickOffsetY = mouseY - positionY;
          isDragging = true;
        }
      },
      false,
    );
    ctx.canvas.addEventListener(
      "mousemove",
      (event) => {
        const rect = ctx.canvas.getBoundingClientRect();
        const mouseX = Math.round(
          (event.clientX - rect.left) * (ctx.canvas.width / rect.width),
        );
        const mouseY = Math.round(
          (event.clientY - rect.top) * (ctx.canvas.height / rect.height),
        );

        if (isDragging) {
          positionX = mouseX - clickOffsetX;
          positionY = mouseY - clickOffsetY;
        }
      },
      false,
    );
    ctx.canvas.addEventListener(
      "mouseup",
      () => {
        isDragging = false;
      },
      false,
    );

    let requestId: number;
    const animate = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(image, 0, 0);
      ctx.drawImage(movableImage, positionX, positionY, width, height);
      requestId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(requestId);
  }, [canvasRef]);

  const handleClick = () => {
    if (canvasRef.current === null) throw new Error("Ref must be non null");
    if (isLock) throw new Error("It is lock now");
    setLock(true);
    canvasRef.current.toBlob((blob) => {
      if (blob === null) throw new Error("Blob must be non null");
      if (anchorRef.current === null) throw new Error("Ref must be non null");
      const downloadUrl = URL.createObjectURL(blob);
      anchorRef.current.href = downloadUrl;
      anchorRef.current.click();
      URL.revokeObjectURL(downloadUrl);
      setLock(false);
    });
  };

  return (
    <div className={styles["canvas_wrapper"]}>
      <canvas className={styles["canvas"]} ref={canvasRef} />
      <div>
        <button disabled={isLock} onClick={handleClick}>
          {isLock ? "処理中…" : "画像を保存"}
        </button>
        <a download ref={anchorRef} hidden />
      </div>
    </div>
  );
};

export default App;
