import React from 'react';

const PERFORMANCE_THRESHOLD = 16; // ms (60fps)

export const onRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  // Format the duration to be more readable
  const formatDuration = (time) => `${time.toFixed(2)}ms`;

  // Create a timestamp for the log
  const timestamp = new Date().toISOString();

  // Log the profiler data
  console.group(`%c🔍 Profiler: ${id}`, 'color: #0066cc; font-weight: bold;');
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`📍 Phase: ${phase}`);
  console.log(`⚡ Actual Duration: ${formatDuration(actualDuration)}`);
  console.log(`📊 Base Duration: ${formatDuration(baseDuration)}`);
  console.log(`🏁 Start Time: ${formatDuration(startTime)}`);
  console.log(`✅ Commit Time: ${formatDuration(commitTime)}`);
  console.groupEnd();

  // If render time is significant, log a warning
  if (actualDuration > PERFORMANCE_THRESHOLD) {
    console.warn(`⚠️ Render took longer than ${PERFORMANCE_THRESHOLD}ms (${formatDuration(actualDuration)})`);
  }
};

// Development-only profiler component
export const DevProfiler = process.env.NODE_ENV === 'development'
  ? ({ id, children }) => (
      <React.Profiler id={id} onRender={onRenderCallback}>
        {children}
      </React.Profiler>
    )
  : ({ children }) => children;