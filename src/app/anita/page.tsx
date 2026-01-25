'use client'
{/* WIP */}

import React, { useMemo, useState } from "react";
import LovesMeFlower from "@/components/LoveMeNotFlower";

export default function Page() {
  const initialPetalCount = 8;

  const initialPetals = useMemo(
    () => Array.from({ length: initialPetalCount }, (_, i) => i),
    [initialPetalCount]
  );

  const [petals, setPetals] = useState<number[]>(initialPetals);
  const [love, setLove] = useState(false);

  const onPetalClick = (id: number) => {
    setPetals((prev) => {
      const next = prev.filter((p) => p !== id);
      // even remaining => "Loves me not..." (matches earlier logic)
      setLove(next.length % 2 === 0);
      return next;
    });
  };

  const onReset = () => {
    setPetals(initialPetals);
    setLove(false);
  };

  return (
    <LovesMeFlower
      petals={petals}
      love={love}
      onPetalClick={onPetalClick}
      onReset={onReset}
    />
  );
}
