import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EnvInfo } from "../components/EnvInfo";

const now = Date.now();

describe("EnvInfo", () => {
  it("high temperature highlights and shows hot modal", () => {
    render(
      <EnvInfo
        envTelemetry={{ temp: 27, hum: 50, location: "Lab", updatedAt: now }}
        tempThresholds={{ high: 26.0, low: 20.0 }}
      />,
    );

    const tempText = screen.getByText(/27.0°C/);
    expect(tempText).toBeInTheDocument();
    expect(tempText).toHaveClass("text-red-600");
    expect(tempText).toHaveClass("twinkle-strong");

    // open modal
    fireEvent.click(tempText);
    expect(screen.getByText("暑すぎ注意!")).toBeInTheDocument();
    expect(screen.getByText(/現在の温度/)).toHaveTextContent(
      "現在の温度: 27.0°C",
    );
  });

  it("low temperature highlights and shows cold modal", () => {
    render(
      <EnvInfo
        envTelemetry={{ temp: 18.5, hum: 40, location: "Lab", updatedAt: now }}
        tempThresholds={{ high: 26.0, low: 20.0 }}
      />,
    );

    const tempText = screen.getByText(/18.5°C/);
    expect(tempText).toBeInTheDocument();
    expect(tempText).toHaveClass("text-blue-600");
    expect(tempText).toHaveClass("twinkle-strong");

    fireEvent.click(tempText);
    expect(screen.getByText("寒すぎ注意!")).toBeInTheDocument();
    expect(screen.getByText(/現在の温度/)).toHaveTextContent(
      "現在の温度: 18.5°C",
    );
  });

  it("normal temperature does not open modal on click", () => {
    render(
      <EnvInfo
        envTelemetry={{ temp: 22.3, hum: 45, location: "Lab", updatedAt: now }}
        tempThresholds={{ high: 26.0, low: 20.0 }}
      />,
    );

    const tempText = screen.getByText(/22.3°C/);
    expect(tempText).toBeInTheDocument();
    expect(tempText).toHaveClass("text-gray-900");

    fireEvent.click(tempText);
    expect(screen.queryByText("暑すぎ注意!")).toBeNull();
    expect(screen.queryByText("寒すぎ注意!")).toBeNull();
  });
});
