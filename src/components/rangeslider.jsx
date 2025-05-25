import React, { useState } from 'react';

function ColoredRangeSlider() {
  const [value, setValue] = useState(50);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const percentage = (value - 0) / (100 - 0) * 100; // Assuming min=0 and max=100

  const sliderStyle = {
    background: `linear-gradient(90deg, red ${percentage}%, grey ${percentage}%)`,
  };

  return (
    <div className="range-slider-container">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        style={sliderStyle}
      />
      <p>Value: {value}</p>
    </div>
  );
}

export default ColoredRangeSlider;
