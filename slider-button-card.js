class SliderButtonCard extends HTMLElement {
  // Private properties
  _config;
  _hass;
  _elements = {};
  _isDragging = false;
  _startX = null;
  _startTime = null;
  _currentValue = 0;

  constructor() {
    super();
    this.doCard();
    this.doStyle();
    this.doAttach();
    this.doQueryElements();
    this.doListen();
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.doUpdateHass();
  }

  // Card creation
  doCard() {
    this._elements.card = document.createElement('div');
    this._elements.card.className = 'card-container';
    this._elements.card.innerHTML = `
      <div class="slider-button" id="button">
        <div class="slider-background" id="sliderBg"></div>
        <div class="icon-container" id="iconContainer">
          <ha-icon id="icon"></ha-icon>
        </div>
        <div class="text-container">
          <div class="name" id="name"></div>
          <div class="percentage" id="percentage"></div>
        </div>
      </div>
    `;
  }

  doStyle() {
    this._elements.style = document.createElement('style');
    this._elements.style.textContent = `
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
      .slider-button.on {
        background: var(--card-background-color, #fff);
      }
      .slider-button.off {
        background: rgba(128, 128, 128, 0.3);
      }
      .slider-background {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: var(--accent-color, #ffc107);
        opacity: 0.2;
        border-radius: 28px;
        transition: width 0.1s ease, opacity 0.3s ease;
        pointer-events: none;
      }
      .slider-background.hidden {
        opacity: 0;
      }
      .icon-container {
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;
        transition: all 0.3s ease;
      }
      .icon-container.on {
        background: var(--accent-color, #ffc107);
      }
      .icon-container.off {
        background: rgba(255, 255, 255, 0.5);
      }
      ha-icon {
        --mdc-icon-size: 28px;
      }
      ha-icon.on {
        color: #fff;
      }
      ha-icon.off {
        color: rgba(255, 255, 255, 0.8);
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
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .name.on {
        color: var(--primary-text-color, #000);
      }
      .name.off {
        color: rgba(255, 255, 255, 0.7);
      }
      .percentage {
        font-size: 16px;
        font-weight: 500;
      }
      .percentage.on {
        color: rgba(0, 0, 0, 0.5);
      }
      .percentage.off {
        color: rgba(255, 255, 255, 0.5);
      }
    `;
  }

  doAttach() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(this._elements.style, this._elements.card);
  }

  doQueryElements() {
    this._elements.button = this.shadowRoot.getElementById('button');
    this._elements.sliderBg = this.shadowRoot.getElementById('sliderBg');
    this._elements.iconContainer = this.shadowRoot.getElementById('iconContainer');
    this._elements.icon = this.shadowRoot.getElementById('icon');
    this._elements.name = this.shadowRoot.getElementById('name');
    this._elements.percentage = this.shadowRoot.getElementById('percentage');
  }

  doListen() {
    // Mouse events
    this._elements.button.addEventListener('mousedown', (e) => this.handleStart(e));
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseup', (e) => this.handleEnd(e));

    // Touch events
    this._elements.button.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleEnd(e));
  }

  doUpdateHass() {
    const entity = this._hass.states[this._config.entity];

    if (!entity) {
      this._elements.name.textContent = 'Entity not found';
      this._elements.percentage.textContent = this._config.entity;
      return;
    }

    const isOn = entity.state === 'on';
    const brightness = entity.attributes.brightness || 0;
    const percentage = Math.round((brightness / 255) * 100);
    this._currentValue = percentage;

    const name = this._config.name || entity.attributes.friendly_name || this._config.entity;
    const icon = this._config.icon || entity.attributes.icon || 'mdi:lightbulb';

    // Update classes
    if (isOn) {
      this._elements.button.classList.remove('off');
      this._elements.button.classList.add('on');
      this._elements.iconContainer.classList.remove('off');
      this._elements.iconContainer.classList.add('on');
      this._elements.icon.classList.remove('off');
      this._elements.icon.classList.add('on');
      this._elements.name.classList.remove('off');
      this._elements.name.classList.add('on');
      this._elements.percentage.classList.remove('off');
      this._elements.percentage.classList.add('on');
      this._elements.sliderBg.classList.remove('hidden');
    } else {
      this._elements.button.classList.remove('on');
      this._elements.button.classList.add('off');
      this._elements.iconContainer.classList.remove('on');
      this._elements.iconContainer.classList.add('off');
      this._elements.icon.classList.remove('on');
      this._elements.icon.classList.add('off');
      this._elements.name.classList.remove('on');
      this._elements.name.classList.add('off');
      this._elements.percentage.classList.remove('on');
      this._elements.percentage.classList.add('off');
      this._elements.sliderBg.classList.add('hidden');
    }

    // Update content
    this._elements.icon.setAttribute('icon', icon);
    this._elements.name.textContent = name;
    this._elements.percentage.textContent = isOn ? percentage + '%' : 'Off';
    this._elements.sliderBg.style.width = percentage + '%';
  }

  handleStart(e) {
    e.preventDefault();
    this._isDragging = false;
    this._hasMoved = false;
    this._startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    this._startTime = Date.now();

    const entity = this._hass.states[this._config.entity];
    const brightness = entity.attributes.brightness || 0;
    this._currentValue = Math.round((brightness / 255) * 100);
  }

  handleMove(e) {
    if (this._startX === null) return;

    const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = Math.abs(currentX - this._startX);

    // If moved more than 5px, consider it a drag
    if (deltaX > 5) {
      this._hasMoved = true;
      this._isDragging = true;
      e.preventDefault();

      const rect = this._elements.button.getBoundingClientRect();
      const x = currentX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      this._currentValue = Math.round(percentage);
      this._elements.sliderBg.style.width = this._currentValue + '%';
      this._elements.percentage.textContent = this._currentValue + '%';
    }
  }

  handleEnd(e) {
    if (this._startX === null) return;

    const timeDelta = Date.now() - this._startTime;

    if (this._isDragging && this._hasMoved) {
      // It was a drag - set brightness
      const brightness = Math.round((this._currentValue / 100) * 255);

      this._hass.callService('light', 'turn_on', {
        entity_id: this._config.entity,
        brightness: brightness
      });
    } else if (timeDelta < 300) {
      // It was a tap - toggle
      const entity = this._hass.states[this._config.entity];
      const isOn = entity.state === 'on';

      this._hass.callService('light', isOn ? 'turn_off' : 'turn_on', {
        entity_id: this._config.entity
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

  static getStubConfig() {
    return { entity: 'light.example' };
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
