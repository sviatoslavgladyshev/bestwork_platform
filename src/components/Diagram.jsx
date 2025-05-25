import React, { useState, useEffect, useRef } from 'react';
import './Diagram.css';
import gmailDataIcon from '/assets/gmail-logo.png';
import gmailOutputIcon from '/assets/gmail-logo.png';
import salesforceIcon from '/assets/salesforce-icon.png';
import companyLogo from '/assets/blue_icon.jpeg';

const defaultGmailOutputSettings = {
  morningMessage: true,
  middayMessage: false,
  endOfDayMessage: false,
  emailAnalysis: false,
  callAnalysis: false,
  prompt: 'Generate a motivational message that...',
};

const Diagram = ({
  isGmailDataConnected = true,
  isGmailOutputConnected = true,
  isSalesforceConnected = true,
  onBack,
  onSave,
  onModalSave,
  gmailDataService: initialGmailDataService,
  gmailOutputSettings: initialGmailOutputSettings = defaultGmailOutputSettings,
  bestWorkValue: initialBestWorkValue = '',
  gmailOutputEnabled: initialGmailOutputEnabled = 'respond',
  gmailOutputValue: initialGmailOutputValue = 'investor outreach',
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [containerSize, setContainerSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth - 100 : 500,
    height: typeof window !== 'undefined' ? window.innerHeight - 100 : 500,
  });
  const [gmailDataService, setGmailDataService] = useState(initialGmailDataService);
  const [gmailOutputService, setGmailOutputService] = useState(
    initialGmailOutputSettings && Object.values(initialGmailOutputSettings).some((val) => val === true)
      ? 'gmailOutput'
      : null
  );
  const [gmailOutputSettings, setGmailOutputSettings] = useState(initialGmailOutputSettings);
  const [bestWorkValue, setBestWorkValue] = useState(initialBestWorkValue);
  const [gmailOutputEnabled, setGmailOutputEnabled] = useState(initialGmailOutputEnabled);
  const [gmailOutputValue, setGmailOutputValue] = useState(initialGmailOutputValue);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activeBlock, setActiveBlock] = useState(null);
  const menuRef = useRef(null);
  const menuButtonRefs = {
    gmailData: useRef(null),
    bestWork: useRef(null),
    gmailOutput: useRef(null),
  };

  // Sync local state with props
  useEffect(() => {
    setGmailDataService(initialGmailDataService);
    setGmailOutputSettings(initialGmailOutputSettings);
    setGmailOutputService(
      initialGmailOutputSettings && Object.values(initialGmailOutputSettings).some((val) => val === true)
        ? 'gmailOutput'
        : null
    );
    setBestWorkValue(initialBestWorkValue);
    setGmailOutputEnabled(initialGmailOutputEnabled);
    setGmailOutputValue(initialGmailOutputValue);
  }, [
    initialGmailDataService,
    initialGmailOutputSettings,
    initialBestWorkValue,
    initialGmailOutputEnabled,
    initialGmailOutputValue,
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !Object.values(menuButtonRefs).some((ref) => ref.current && ref.current.contains(event.target))
      ) {
        setIsMenuOpen(false);
        setActiveBlock(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update container size and set initial zoom
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth - 100;
      const newHeight = window.innerHeight - 100;
      setContainerSize({
        width: newWidth,
        height: newHeight,
      });

      const standardNodeWidth = window.innerWidth < 800 ? 260 : 320;
      const bestWorkNodeWidth = window.innerWidth < 800 ? 400 : 480;
      const gmailOutputNodeWidth = window.innerWidth < 800 ? 400 : 480;
      const totalNodes = 3;
      const edgeMargin = 10;
      const totalBlockWidth = standardNodeWidth + bestWorkNodeWidth + gmailOutputNodeWidth;
      const remainingSpace = newWidth - totalBlockWidth - 2 * edgeMargin;
      const gap = Math.max(50, remainingSpace / (totalNodes - 1));
      const padding = 40;
      const totalWidth = totalBlockWidth + (totalNodes - 1) * gap + padding * 2;
      const standardNodeHeight = Math.min(Math.max(80 + newHeight * 0.15, 80), 120);
      const bestWorkNodeHeight = Math.min(Math.max(160 + newHeight * 0.15, 160), 200);
      const maxNodeHeight = Math.max(standardNodeHeight, bestWorkNodeHeight);
      const totalHeight = maxNodeHeight + padding * 2 + 60;
      const zoomToFitWidth = newWidth / totalWidth;
      const zoomToFitHeight = newHeight / totalHeight;
      const newZoomLevel = Math.min(zoomToFitWidth, zoomToFitHeight);
      setZoomLevel(Math.min(Math.max(newZoomLevel, 0.5), 2));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle Ctrl key for zooming
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Control') {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Control') {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleDoubleClick = () => {
    setZoomLevel(1);
    setPanX(0);
  };

  const handleStart = (event) => {
    setIsInteracting(true);
    const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMove = (event) => {
    event.preventDefault();
    if (!isInteracting) return;

    const clientX = event.type === 'touchmove' ? event.touches[0]?.clientX : event.clientX;
    const clientY = event.type === 'touchmove' ? event.touches[0]?.clientY : event.clientY;

    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;

    if (isCtrlPressed) {
      const zoomSpeed = 0.005;
      const newZoomLevel = zoomLevel + (deltaY > 0 ? -zoomSpeed : zoomSpeed) * Math.abs(deltaY / 10);
      setZoomLevel(Math.min(Math.max(newZoomLevel, 0.5), 2));
    } else {
      const panSpeed = 0.8;
      setPanX(panX + deltaX * panSpeed);
    }

    setStartPos({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    setIsInteracting(false);
  };

  const handleZoomIn = () => {
    const newZoomLevel = zoomLevel + 0.1;
    setZoomLevel(Math.min(Math.max(newZoomLevel, 0.5), 2));
  };

  const handleZoomOut = () => {
    const newZoomLevel = zoomLevel - 0.1;
    setZoomLevel(Math.min(Math.max(newZoomLevel, 0.5), 2));
  };

  const handleFitToWidth = () => {
    const standardNodeWidth = containerSize.width < 800 ? 260 : 320;
    const bestWorkNodeWidth = containerSize.width < 800 ? 400 : 480;
    const gmailOutputNodeWidth = containerSize.width < 800 ? 400 : 480;
    const totalNodes = 3;
    const edgeMargin = 10;
    const totalBlockWidth = standardNodeWidth + bestWorkNodeWidth + gmailOutputNodeWidth;
    const newWidth = containerSize.width;
    const remainingSpace = newWidth - totalBlockWidth - 2 * edgeMargin;
    const gap = Math.max(50, remainingSpace / (totalNodes - 1));
    const padding = 40;
    const totalWidth = totalBlockWidth + (totalNodes - 1) * gap + padding * 2;
    const standardNodeHeight = Math.min(Math.max(80 + containerSize.height * 0.15, 80), 120);
    const bestWorkNodeHeight = Math.min(Math.max(160 + containerSize.height * 0.15, 160), 200);
    const maxNodeHeight = Math.max(standardNodeHeight, bestWorkNodeHeight);
    const totalHeight = maxNodeHeight + padding * 2 + 60;

    const zoomToFitWidth = newWidth / totalWidth;
    const zoomToFitHeight = containerSize.height / totalHeight;
    const newZoomLevel = Math.min(zoomToFitWidth, zoomToFitHeight);

    setZoomLevel(Math.min(Math.max(newZoomLevel, 0.5), 2));
    setPanX(0);
  };

  const handlePermissionChange = (e) => {
    const newPermission = e.target.value;
    setGmailDataService(newPermission);
    if (onModalSave) {
      onModalSave({ gmailDataService: newPermission });
    }
  };

  const handleBestWorkValueChange = (e) => {
    const newValue = e.target.value;
    setBestWorkValue(newValue);
    if (onModalSave) {
      onModalSave({ bestWorkValue: newValue });
    }
  };

  const handleGmailOutputEnabledChange = (e) => {
    const newEnabled = e.target.value;
    setGmailOutputEnabled(newEnabled);
    if (onModalSave) {
      onModalSave({ gmailOutputEnabled: newEnabled });
    }
  };

  const handleGmailOutputValueChange = (e) => {
    const newValue = e.target.value;
    setGmailOutputValue(newValue);
    if (onModalSave) {
      onModalSave({ gmailOutputValue: newValue });
    }
  };

  const handleMenuClick = (blockId, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY,
    });
    setActiveBlock(blockId);
    setIsMenuOpen((prev) => !prev);
  };

  const handleDeleteBlock = (blockId) => {
    console.log(`Delete block: ${blockId}`);
    if (blockId === 'gmailData') {
      setGmailDataService('');
    } else if (blockId === 'bestWork') {
      setBestWorkValue('');
    } else if (blockId === 'gmailOutput') {
      setGmailOutputService(null);
      setGmailOutputSettings(defaultGmailOutputSettings);
      setGmailOutputEnabled('respond');
      setGmailOutputValue('investor outreach');
    }
    setIsMenuOpen(false);
    setActiveBlock(null);
  };

  const getGmailDataNodeContent = () => {
    const label = gmailDataService
      ? `Gmail Data (${gmailDataService
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')})`
      : 'Get sales rep performance data from Gmail Data';
    return {
      label,
      icon: gmailDataService ? gmailDataIcon : null,
      className: 'diagram-gmail-data-node',
    };
  };

  const getGmailOutputNodeContent = () => {
    const label = 'Send performance update to reps + email and call analysis';
    if (!gmailOutputService) {
      return {
        label,
        icon: null,
        className: 'diagram-gmail-output-node-plus',
        connected: false,
      };
    }
    return {
      label,
      icon: gmailOutputIcon,
      className: 'diagram-gmail-output-node',
      connected: isGmailOutputConnected,
    };
  };

  const gmailDataNodeContent = getGmailDataNodeContent();
  const gmailOutputNodeContent = getGmailOutputNodeContent();

  const standardNodeWidth = containerSize.width < 800 ? 260 : 320;
  const standardNodeHeight = Math.min(Math.max(80 + containerSize.height * 0.15, 80), 120);
  const bestWorkNodeWidth = containerSize.width < 800 ? 400 : 480;
  const bestWorkNodeHeight = Math.min(Math.max(160 + containerSize.height * 0.15, 160), 200);
  const gmailOutputNodeWidth = containerSize.width < 800 ? 400 : 480;
  const gmailOutputNodeHeight = Math.min(Math.max(160 + containerSize.height * 0.15, 160), 200);
  const edgeMargin = 10;
  const totalBlockWidth = standardNodeWidth + bestWorkNodeWidth + gmailOutputNodeWidth;
  const remainingSpace = containerSize.width - totalBlockWidth - 2 * edgeMargin;
  const minGap = 50;
  const gap = Math.max(minGap, remainingSpace / 2);

  // Block positioning
  const gmailDataLeft = edgeMargin;
  const gmailDataXRight = gmailDataLeft + standardNodeWidth;

  const bestWorkLeft = gmailDataXRight + gap;
  const bestWorkXLeft = bestWorkLeft;
  const bestWorkXRight = bestWorkLeft + bestWorkNodeWidth;

  const gmailOutputLeft = bestWorkXRight + gap;
  const gmailOutputXLeft = gmailOutputLeft;
  const gmailOutputXRight = gmailOutputLeft + gmailOutputNodeWidth;

  // Action header positioning
  const gmailDataActionHeaderLeft = gmailDataLeft;
  const bestWorkActionHeaderLeft = bestWorkLeft;
  const gmailOutputActionHeaderLeft = gmailOutputLeft;

  const centerY = '50%';
  const actionHeaderOffset = 22;
  const gmailDataActionHeaderTop = `calc(${centerY} - ${standardNodeHeight / 2}px - ${actionHeaderOffset}px)`;
  const bestWorkActionHeaderTop = `calc(${centerY} - ${bestWorkNodeHeight / 2}px - ${actionHeaderOffset}px)`;
  const gmailOutputActionHeaderTop = `calc(${centerY} - ${gmailOutputNodeHeight / 2}px - ${actionHeaderOffset}px)`;

  return (
    <div className="diagram-wrapper">
      <div
        className="diagram-container"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="diagram-content"
          style={{ transform: `scale(${zoomLevel}) translateX(${panX}px)` }}
        >
          {/* Gmail Data Node and Action Header */}
          <div className="diagram-node-group">
            <div
              className="diagram-action-header diagram-action-label diagram-gmail-data-action-header"
              style={{
                left: `${gmailDataActionHeaderLeft}px`,
                top: gmailDataActionHeaderTop,
              }}
              role="heading"
              aria-label="Action Label for Gmail Data"
            >
              <div className="diagram-action-content">
                <img
                  src="/assets/data_icon_yellow.png"
                  alt="Data Icon"
                  className="diagram-action-icon"
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <span className="diagram-action-text-bestwork">Data</span>
              </div>
            </div>
            <div
              className={`diagram-node diagram-gmail-data-node ${gmailDataNodeContent.className}`}
              style={{
                left: `${gmailDataLeft}px`,
                top: `calc(${centerY} - ${standardNodeHeight / 2}px)`,
                width: `${standardNodeWidth}px`,
              }}
            >
              <div className="diagram-gmail-data-content">
                <div className="diagram-gmail-data-row diagram-gmail-data-header">
                  <img
                    src={gmailDataNodeContent.icon || '/assets/gmail-logo.png'}
                    alt="Gmail Logo"
                    className="diagram-gmail-logo"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <span className="diagram-gmail-title">Gmail</span>
                  <button
                    ref={menuButtonRefs.gmailData}
                    className="diagram-gmail-menu-button"
                    aria-label="More options"
                    onClick={(e) => handleMenuClick('gmailData', e)}
                  >
                    ⋮
                  </button>
                </div>
                <div className="diagram-gmail-data-row diagram-gmail-data-permissions">
                  <span className="diagram-permission-text">Permissions</span>
                  <select
                    className="diagram-permission-select"
                    value={gmailDataService || ''}
                    onChange={handlePermissionChange}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Select Permission</option>
                    <option value="read and write">Read and Write</option>
                    <option value="read only">Read Only</option>
                    <option value="write only">Write Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* BestWork Node and Action Header */}
          <div className="diagram-node-group">
            <div
              className="diagram-action-header diagram-action-label diagram-bestwork-action-header"
              style={{
                left: `${bestWorkActionHeaderLeft}px`,
                top: bestWorkActionHeaderTop,
              }}
              role="heading"
              aria-label="Action Label for BestWork"
            >
              <div className="diagram-action-content">
                <img
                  src="/assets/logic_icon_purple.png"
                  alt="Logic Icon"
                  className="diagram-action-icon"
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <span className="diagram-action-text-bestwork">Logic</span>
              </div>
            </div>
            <div
              className="diagram-node diagram-bestwork-node diagram-center"
              style={{
                left: `${bestWorkLeft}px`,
                top: `calc(${centerY} - ${bestWorkNodeHeight / 2}px)`,
                width: `${bestWorkNodeWidth}px`,
              }}
            >
              <div className="diagram-gmail-data-content">
                <div className="diagram-gmail-data-row diagram-gmail-data-header">
                  <img
                    src={companyLogo}
                    alt="BestWork AI engine"
                    className="diagram-bestwork-logo"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <span className="diagram-gmail-title">Conditional</span>
                  <button
                    ref={menuButtonRefs.bestWork}
                    className="diagram-gmail-menu-button"
                    aria-label="More options"
                    onClick={(e) => handleMenuClick('bestWork', e)}
                  >
                    ⋮
                  </button>
                </div>
                <div className="diagram-bestwork-logic-condition">
                  <span className="diagram-bestwork-logic-if">If</span>
                  <input
                    type="text"
                    className="diagram-bestwork-logic-category"
                    value="Email category"
                    readOnly
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="diagram-bestwork-logic-equals">=</span>
                  <select
                    className="diagram-bestwork-logic-value"
                    value={bestWorkValue}
                    onChange={handleBestWorkValueChange}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Select Value</option>
                    <option value="cold sales">Cold Sales</option>
                    <option value="information request">Information Request</option>
                    <option value="schedule meeting">Schedule Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="diagram-gmail-data-row diagram-gmail-data-permissions">
                  <div className="diagram-model-text">
                    <div className="diagram-model-content">
                      <img
                        src="/assets/model_icon_gpt4.png"
                        alt="GPT Model Icon"
                        className="diagram-model-icon"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                      <span>gpt-o3-mini</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gmail Output Node and Action Header */}
          <div className="diagram-node-group">
            <div
              className="diagram-action-header diagram-action-label diagram-gmail-output-action-header"
              style={{
                left: `${gmailOutputActionHeaderLeft}px`,
                top: gmailOutputActionHeaderTop,
              }}
              role="heading"
              aria-label="Action Label for Gmail Output"
            >
              <div className="diagram-action-content">
                <img
                  src="/assets/output_icon_green.png"
                  alt="Output Icon"
                  className="diagram-action-icon"
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <span className="diagram-action-text-bestwork">Output</span>
              </div>
            </div>
            <div
              className={`diagram-node diagram-gmail-output-node ${
                gmailOutputNodeContent.connected ? 'diagram-connected' : 'diagram-disconnected'
              }`}
              style={{
                left: `${gmailOutputLeft}px`,
                top: `calc(${centerY} - ${gmailOutputNodeHeight / 2}px)`,
                width: `${gmailOutputNodeWidth}px`,
              }}
            >
              <div className="diagram-gmail-data-content">
                <div className="diagram-gmail-data-row diagram-gmail-data-header">
                  {gmailOutputNodeContent.icon ? (
                    <img
                      src={gmailOutputIcon}
                      alt="Gmail Output"
                      className="diagram-gmail-output-logo"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  ) : (
                    <span className="diagram-gmail-logo diagram-plus-icon">
                      <span className="diagram-plus-symbol">+</span>
                    </span>
                  )}
                  <span className="diagram-gmail-title">Gmail Output</span>
                  <button
                    ref={menuButtonRefs.gmailOutput}
                    className="diagram-gmail-menu-button"
                    aria-label="More options"
                    onClick={(e) => handleMenuClick('gmailOutput', e)}
                  >
                    ⋮
                  </button>
                </div>
                <div className="diagram-gmail-output-logic-condition">
                  <select
                    className="diagram-bestwork-logic-category"
                    value={gmailOutputEnabled}
                    onChange={handleGmailOutputEnabledChange}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="respond">Respond</option>
                    <option value="ignore">Ignore</option>
                    <option value="store for summary">Store for Summary</option>
                  </select>
                  <span className="diagram-bestwork-logic-equals">With</span>
                  <select
                    className="diagram-bestwork-logic-value"
                    value={gmailOutputValue}
                    onChange={handleGmailOutputValueChange}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="investor outreach">Investor Outreach</option>
                    <option value="sales deck">Sales Deck</option>
                    <option value="not interested">Not Interested</option>
                    <option value="colleague support">Colleague Support</option>
                    <option value="project update">Project Update</option>
                    <option value="ooo">OOO</option>
                  </select>
                </div>
                <div className="diagram-gmail-data-row diagram-gmail-data-permissions">
                  <div className="diagram-model-text">
                    <div className="diagram-model-content">
                      <img
                        src="/assets/model_icon_gpt4.png"
                        alt="GPT Model Icon"
                        className="diagram-model-icon"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                      <span>gpt-4.1-mini</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SVG Lines */}
          <svg className="diagram-lines">
            <line
              x1={gmailDataXRight}
              y1={centerY}
              x2={bestWorkXLeft}
              y2={centerY}
              stroke="#4A90E2"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <line
              x1={bestWorkXRight}
              y1={centerY}
              x2={gmailOutputXLeft}
              y2={centerY}
              stroke="#4A90E2"
              strokeWidth="2"
              strokeDasharray={gmailOutputNodeContent.connected ? '5,5' : '2,2'}
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu for Delete Block */}
      {isMenuOpen && activeBlock && (
        <div
          ref={menuRef}
          className="diagram-dropdown-menu"
          style={{
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
          }}
        >
          <div
            className="diagram-dropdown-item diagram-dropdown-item-delete"
            onClick={() => handleDeleteBlock(activeBlock)}
            role="menuitem"
          >
            Delete Block
          </div>
        </div>
      )}

      <div className="diagram-zoom-control">
        <button
          onClick={handleZoomIn}
          className="diagram-zoom-button"
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleFitToWidth}
          className="diagram-fit-to-width-button"
          title="Fit to Width"
          aria-label="Fit to Width"
        >
          •
        </button>
        <button
          onClick={handleZoomOut}
          className="diagram-zoom-button"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
};

export default Diagram;