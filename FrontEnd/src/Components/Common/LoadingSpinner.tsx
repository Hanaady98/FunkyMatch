"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "white";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = "md",
  className = "",
  color = "primary",
}) => {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  const colorClasses = {
    primary: "border-blue-500 border-t-transparent",
    white: "border-white border-t-transparent",
  };

  const textColor = color === "primary" ? "text-gray-600" : "text-white";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center justify-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
          aria-label="Loading"
        />
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${textColor} ${size === "lg" ? "text-base" : ""}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default React.memo(LoadingSpinner);
