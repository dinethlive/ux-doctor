import React from "react";

const App = () => {
  return (
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <p>Deeply nested divs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div onClick={() => alert("clicked")}>
        Click me (no keyboard handler, no role)
      </div>

      <div role="button" onClick={() => {}}>
        Custom button (no tabIndex)
      </div>

      <div role="invalidrole">Invalid ARIA role</div>

      <button role="button">Redundant role</button>

      <img src="/photo.jpg" />

      <img src="/decorative.svg" alt="" />

      <svg viewBox="0 0 24 24">
        <path d="M12 2L2 22h20L12 2z" />
      </svg>

      <input type="email" name="email" />

      <input type="text" name="username" required />

      <input type="text" aria-invalid="true" />

      <video autoPlay src="/video.mp4" />

      <div role="dialog">
        <p>Modal content without escape handler</p>
      </div>

      <div id="duplicate">First</div>
      <div id="duplicate">Second</div>

      <div tabIndex={5}>Positive tabindex</div>

      <div aria-hidden="true" tabIndex={0}>
        Hidden but focusable
      </div>
    </div>
  );
};

export default App;
