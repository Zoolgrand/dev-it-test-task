"use client";

import { useState } from "react";

export function useToggle(initial = false): { isOn: boolean; toggle: () => void } {
  const [isOn, setIsOn] = useState(initial);

  return { isOn, toggle: () => setIsOn((previous) => !previous) };
}
