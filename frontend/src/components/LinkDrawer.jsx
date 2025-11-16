"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";

const data = [
  { goal: 400 },
  { goal: 650 },
  { goal: 800 },
  { goal: 900 },
  { goal: 1000 },
  { goal: 150 },
  { goal: 300 },
  { goal: 450 },
  { goal: 600 },
];

const DragHandle = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-pink-500 cursor-grab" />
  );
};

const GoalAdjuster = ({ goal, onAdjust }) => (
  <div className="flex items-center justify-center space-x-2">
    <Button
      variant="outline"
      size="icon"
      onClick={() => onAdjust(-10)}
      disabled={goal <= 200}
      className="h-8 w-8 shrink-0 rounded-full border border-neutral-300 bg-neutral-50"
    >
      <Minus />
      <span className="sr-only">Decrease</span>
    </Button>

    <div className="flex-1 text-center">
      <div className="text-7xl font-bold tracking-tighter text-foreground">
        {goal}
      </div>
      <div className="text-sm text-muted-foreground uppercase">
        Calories/day
      </div>
    </div>

    <Button
      variant="outline"
      size="icon"
      onClick={() => onAdjust(10)}
      disabled={goal >= 400}
      className="h-8 w-8 shrink-0 rounded-full border border-neutral-300 bg-neutral-50"
    >
      <Plus />
      <span className="sr-only">Increase</span>
    </Button>
  </div>
);

const LinkDrawer = () => {
  const [goal, setGoal] = useState(400);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onAdjust = (delta) => {
    setGoal(Math.max(200, Math.min(400, goal + delta)));
  };

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open Drawer">
          Link
        </Button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col bg-neutral-100 rounded-t-lg border border-neutral-300 hello">
        {/* Drag handle */}
        <DragHandle visible={drawerOpen} />

        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-foreground">Move Goal</DrawerTitle>
            <DrawerDescription className="text-muted-foreground">
              Set your daily activity goal.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <GoalAdjuster goal={goal} onAdjust={onAdjust} />

            <div className="mt-3 h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <Bar
                    dataKey="goal"
                    style={{ fill: "hsl(var(--foreground))", opacity: 0.9 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DrawerFooter className="mt-auto flex flex-col gap-2 p-4 sm:flex-row sm:gap-2">
            <Button
              type="button"
              className="w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600"
            >
              Submit
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto border border-neutral-300 bg-neutral-50 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LinkDrawer;
