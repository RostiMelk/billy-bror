"use client";

import { type ChangeEvent, useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  initialValue?: number;
}

export function NumberInput({
  min = 0,
  max = Number.POSITIVE_INFINITY,
  initialValue = min,
  onChange,
  ...props
}: NumberInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(Math.max(min, Math.min(max, initialValue)));
  }, [min, max, initialValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? min : Number(e.target.value);
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setValue(clampedValue);
    if (onChange) {
      const event = {
        ...e,
        target: {
          ...e.target,
          value: clampedValue.toString(),
        },
      };
      onChange(event as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const increment = () => {
    const newValue = Math.min(max, value + 1);
    setValue(newValue);
    if (onChange) {
      const event = new Event("change", { bubbles: true });
      Object.defineProperty(event, "target", {
        value: { value: newValue.toString() },
        enumerable: true,
      });
      onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const decrement = () => {
    const newValue = Math.max(min, value - 1);
    setValue(newValue);
    if (onChange) {
      const event = new Event("change", { bubbles: true });
      Object.defineProperty(event, "target", {
        value: { value: newValue.toString() },
        enumerable: true,
      });
      onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const inputWidth = useMemo(() => {
    return `${Math.max(value.toString().length, 2) * 0.7 + 1.5}rem`;
  }, [value]);

  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10"
        onClick={decrement}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          className="text-center focus:outline-none focus:ring-2 focus:ring-ring focus:border-input px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={min}
          max={max}
          style={{ width: inputWidth }}
          {...props}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10"
        onClick={increment}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
