class SliderButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isDragging = false;
    this._startX = 0;
    this._currentValue = 0;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this.config.entity];

    if (!entity) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: red;">
            Entity not found: ${this.config.entity}
          </div>
        </ha-card>
      `;
      return;
    }

    const isOn = entity.state === 'on';
    const brightness = entity.attributes.brightness || 0;
    const percentage = Math.round((brightness / 255) * 100);
    this._currentValue = percentage;

    const name = this.config.name || entity.attributes.friendly_name || this.config.entity;
    const icon = this.config.icon || entity.attributes.icon || 'mdi:lightbulb';

    this.render(isOn, percentage, name, icon);
  }

  render(isOn, percentage, name, icon) {
    const bgColor = isOn ? 'var(--card-background-color, #fff)' : 'rgba(128, 128, 128, 0.3)';
    const textColor = isOn ? 'var(--primary-text-color, #000)' : 'rgba(255, 255, 255, 0.7)';
    const iconColor = isOn ? 'var(--accent-color, #ffc107)' : 'rgba(255, 255, 255, 0.5)';
    const percentageColor = isOn ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .card-container {
          position: relative;
          padding: 8px;
        }
        .slider-button {
          position: relative;
          display: flex;
          align-items: center;
          padding: 20px 24px;
          border-radius: 28px;
          background: ${bgColor};
          cursor: pointer;
          user-select: none;
          touch-action: none;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .slider-button:active {
          transform: scale(0.98);
        }
        .slider-background {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: var(--accent-color, #ffc107);
          opacity: ${isOn ? 0.2 : 0};
          border-radius: 28px;
          transition: width 0.1s ease, opacity 0.3s ease;
          pointer-events: none;
          width: ${percentage}%;
        }
        .icon-container {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${iconColor};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        ha-icon {
          --mdc-icon-size: 28px;
          color: ${isOn ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
        }
        .text-container {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .name {
          font-size: 18px;
          font-weight: 600;
          color: ${textColor};
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .percentage {
          font-size: 16px;
          color: ${percentageColor};
          font-weight: 500;
        }
      </style>
      <div class="card-container">
        <div class="slider-button" id="button">
          <div class="slider-background" id="sliderBg"></div>
          <div class="icon-container">
            <ha-icon icon="${icon}"></ha-icon>
          </div>
          <div class="text-container">
            <div class="name">${name}</div>
            <div class="percentage">${isOn ? percentage + '%' : 'Off'}</div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const button = this.shadowRoot.getElementById('button');
    const sliderBg = this.shadowRoot.getElementById('sliderBg');

    // Mouse events
    button.addEventListener('mousedown', (e) => this.handleStart(e, button));
    document.addEventListener('mousemove', (e) => this.handleMove(e, button, sliderBg));
    document.addEventListener('mouseup', (e) => this.handleEnd(e, button));

    // Touch events
    button.addEventListener('touchstart', (e) => this.handleStart(e, button), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleMove(e, button, sliderBg), { passive: false });
    document.addEventListener('touchend', (e) => this.handleEnd(e, button));
  }

  handleStart(e, button) {
    e.preventDefault();
    this._isDragging = false;
    this._hasMoved = false;
    this._startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    this._startTime = Date.now();

    const entity = this._hass.states[this.config.entity];
    const brightness = entity.attributes.brightness || 0;
    this._currentValue = Math.round((brightness / 255) * 100);
  }

  handleMove(e, button, sliderBg) {
    if (this._startX === null) return;

    const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = Math.abs(currentX - this._startX);

    // If moved more than 5px, consider it a drag
    if (deltaX > 5) {
      this._hasMoved = true;
      this._isDragging = true;
      e.preventDefault();

      const rect = button.getBoundingClientRect();
      const x = currentX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      this._currentValue = Math.round(percentage);
      sliderBg.style.width = this._currentValue + '%';

      // Update the display immediately
      const percentageEl = this.shadowRoot.querySelector('.percentage');
      if (percentageEl) {
        percentageEl.textContent = this._currentValue + '%';
      }
    }
  }

  handleEnd(e, button) {
    if (this._startX === null) return;

    const timeDelta = Date.now() - this._startTime;

    if (this._isDragging && this._hasMoved) {
      // It was a drag - set brightness
      const brightness = Math.round((this._currentValue / 100) * 255);

      this._hass.callService('light', 'turn_on', {
        entity_id: this.config.entity,
        brightness: brightness
      });
    } else if (timeDelta < 300) {
      // It was a tap - toggle
      const entity = this._hass.states[this.config.entity];
      const isOn = entity.state === 'on';

      this._hass.callService('light', isOn ? 'turn_off' : 'turn_on', {
        entity_id: this.config.entity
      });
    }

    this._isDragging = false;
    this._hasMoved = false;
    this._startX = null;
    this._startTime = null;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('slider-button-card', SliderButtonCard);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'slider-button-card',
  name: 'Slider Button Card',
  description: 'A card that combines a toggle button with a slider for lights',
  preview: true,
});

console.info(
  '%c SLIDER-BUTTON-CARD %c Version 1.0.0 ',
  'color: white; background: #ffc107; font-weight: 700;',
  'color: #ffc107; background: black; font-weight: 700;'
);
