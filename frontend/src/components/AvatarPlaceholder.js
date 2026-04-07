/**
 * components/AvatarPlaceholder.js
 * Renders initials avatar when no profile pic is available.
 */
import React from "react";

const COLORS = [
  "#14B8A6",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
];

const getColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export default function AvatarPlaceholder({
  name = "",
  size = 40,
  style = {},
}) {
  const color = getColor(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}22`,
        border: `2px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontSize: size * 0.38,
        color,
        fontWeight: 400,
        flexShrink: 0,
        ...style,
      }}
    >
      {initials(name)}
    </div>
  );
}
