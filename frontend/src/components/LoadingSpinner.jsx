import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fullscreen-loader-container">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
