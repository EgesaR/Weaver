// DragExample.jsx
import React from "react";
import {
  motion,
  useAnimate,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import useMeasure from "react-use-measure";

function DragExample({ absolute = false }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="grid h-screen place-content-center bg-neutral-900">
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-indigo-500 px-4 py-2 text-white transition-colors hover:bg-indigo-600"
      >
        Open Drawer
      </button>
      <DragCloseDrawer open={open} setOpen={setOpen} absolute={absolute}>
        <div className="mx-auto max-w-2xl space-y-4 text-neutral-400">
          Hello world
          <p>I want here i want a juice</p>
        </div>
      </DragCloseDrawer>
    </div>
  );
}

const DragCloseDrawer = ({ open, setOpen, children, absolute }) => {
  const controls = useDragControls();
  const y = useMotionValue(0);
  const [scope, animate] = useAnimate();
  const [drawerRef, { height }] = useMeasure();

  const handleClose = async () => {
    animate(scope.current, { opacity: [1, 0] });
    const yStart = typeof y.get() === "number" ? y.get() : 0;
    await animate("#drawer", { y: [yStart, height] });
    setOpen(false);
  };

  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClose}
          ref={scope}
          className="fixed inset-0 z-50 bg-neutral-950/70"
        >
          <motion.div
            ref={drawerRef}
            id="drawer"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            style={{ y }}
            onDragEnd={() => y.get() >= 100 && handleClose()}
            transition={{ ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
            className={`${
              absolute ? "absolute" : "fixed"
            } bottom-0 h-[75vh] w-full overflow-hidden rounded-t-3xl bg-neutral-900`}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-neutral-950 p-4">
              <button
                className="h-2 w-14 cursor-grab touch-none rounded-full bg-neutral-700 active:cursor-grabbing"
                onPointerDown={(e) => {
                  controls.start(e);
                }}
              ></button>
            </div>
            <div className="relative z-0 h-full overflow-y-auto p-4 pt-12">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default DragExample;
