# Slider Button Card for Home Assistant

A custom Lovelace card that combines a toggle button with a slider, inspired by iOS control center. Tap to toggle lights on/off, or slide to adjust brightness - all in one elegant card.

![Slider Button Card Demo](https://img.shields.io/badge/Home%20Assistant-Custom%20Card-blue)

## Features

- **Tap to Toggle**: Quick tap to turn lights on/off
- **Slide to Adjust**: Drag horizontally to adjust brightness from 0-100%
- **Visual Feedback**: Dynamic background gradient shows current brightness level
- **iOS-Inspired Design**: Clean, modern interface similar to iOS control center
- **Smooth Animations**: Polished transitions and interactions
- **Touch & Mouse Support**: Works on both mobile and desktop

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the menu (three dots) in the top right
4. Select "Custom repositories"
5. Add this repository URL
6. Click "Install"
7. Restart Home Assistant

### Manual Installation

1. Download `slider-button-card.js`
2. Copy it to `<config>/www/slider-button-card.js`
3. Add the resource to your Lovelace configuration:

**Via UI:**
- Go to Settings → Dashboards → Resources
- Click "Add Resource"
- URL: `/local/slider-button-card.js`
- Resource type: JavaScript Module

**Via YAML:**
```yaml
resources:
  - url: /local/slider-button-card.js
    type: module
```

4. Restart Home Assistant

## Usage

### Basic Configuration

```yaml
type: custom:slider-button-card
entity: light.living_room
```

### Full Configuration

```yaml
type: custom:slider-button-card
entity: light.bedroom
name: Bedroom Light
icon: mdi:ceiling-light
```

### Configuration Options

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `entity` | string | **yes** | - | Entity ID of the light |
| `name` | string | no | Entity's friendly name | Display name for the light |
| `icon` | string | no | Entity's icon | MDI icon to display |

### Example Dashboard

```yaml
views:
  - title: Lights
    cards:
      - type: grid
        columns: 2
        square: false
        cards:
          - type: custom:slider-button-card
            entity: light.living_room
            name: Living Room
            icon: mdi:sofa

          - type: custom:slider-button-card
            entity: light.bedroom
            name: Bedroom
            icon: mdi:bed

          - type: custom:slider-button-card
            entity: light.kitchen
            name: Kitchen
            icon: mdi:silverware-fork-knife

          - type: custom:slider-button-card
            entity: light.bathroom
            name: Bathroom
            icon: mdi:shower
```

## How It Works

- **Tap**: Quick tap (< 300ms) toggles the light on/off
- **Drag**: Press and drag horizontally to adjust brightness
  - Drag left to decrease brightness
  - Drag right to increase brightness
  - Release to set the brightness
- **Visual Feedback**:
  - When off: Dark background with "Off" text
  - When on: Light background with brightness percentage
  - Slider background shows current brightness level

## Supported Entities

Currently supports:
- `light.*` entities with brightness control

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS and macOS)
- Home Assistant Mobile App: ✅ Full support

## Troubleshooting

### Card doesn't appear
- Make sure you've added the resource correctly
- Check browser console for errors (F12)
- Try clearing browser cache (Ctrl+Shift+R)

### Entity not found error
- Verify the entity ID exists in Developer Tools → States
- Check that the entity is a light with brightness support

### Slider not working
- Ensure the light supports brightness control
- Check that the entity's `brightness` attribute exists

## Development

To modify or contribute:

1. Clone this repository
2. Make your changes to `slider-button-card.js`
3. Test in Home Assistant
4. Submit a pull request

## Credits

Inspired by iOS Control Center design and Home Assistant's excellent community.

## License

MIT License - Feel free to use and modify as needed.

## Support

If you find this card useful, consider:
- Starring this repository
- Reporting issues on GitHub
- Contributing improvements

---

Made with ❤️ for the Home Assistant community
