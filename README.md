# SVTA-Non-Linear-Generator

A JavaScript web application (the SVTA Non-Linear Ads Generator, or Layout Controller) that previews concurrent ("non-linear") video ad layouts and generates the matching signaling payloads. It follows the concurrent presentation model of **SVTA2053 – Ad Creative Signaling in DASH and HLS (v4 draft, HLS update)**, which aligns with the formats of the **IAB Tech Lab Ad Format Guidelines for Digital Video & CTV v2.0**.

## Features

- **Preview Player**: Renders one layout option over a 16:9 player area. Pick the option from the dropdown next to the size inputs. Size the player by dragging, by typing width × height, or with the 1920×1080 preset, and lock it at that size.
- **Layout options**: Build several presentation options for a slot (`layoutOptions`), one tab each, every tab with its own adType, primary content and assets.
- **Asset Form**: Sets the primary content layout and adds additional assets, each with ID, media type, URI, viewport, zDepth and volume.
- **Default layouts per adType**: Selecting an adType loads its default layout (SVTA2053 v4, 5.3.2, Table 20).
- **Data Preview**: Shows the output live, as an HLS ASSET-LIST (JSON) or as a DASH MPD (XML).

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

The server runs on port 3000 by default. To use another port, set the `PORT` environment variable.

## Usage

The Asset Form starts with one layout option (tab **1**). Each tab is one entry of `layoutOptions`, and the tabs are listed in order of preference.

1. Select an `adType` for the tab. Each tab starts as `customLayout`: a layout with no preset (full-frame primary content), emitted with `"type": "customLayout"`. Note that `customLayout` is not a PresentationType of SVTA2053 v4 Table 2. Changing the adType replaces the tab's primary content and assets with that adType's defaults.
2. Click **ADD ASSET**. The first click adds the default assets for the tab's adType. Each later click, and every click on a `customLayout` tab, adds one corner-overlay asset.
3. Edit the asset properties:
   - **ID**: Identifier of the element, unique within the layout
   - **Type**: IANA media type (HLS, DASH, MP4, PNG, JPEG, SVG). `image/*` is rendered as an image; any other type is rendered as a media stream.
   - **URI**: Location of the asset (required)
   - **viewport**: `top right bottom left`, each an inset in % (0–100) from the same edge of the player area. `0 0 0 0` is full frame; `0 75 75 0` is the top-left quarter.
   - **zDepth**: Stacking order; higher values are drawn on top
   - **volume**: Initial volume, 0–100
4. Optionally expand **Primary Content** to change the tab's primary content viewport, zDepth or volume.
5. Click **ADD LAYOUT** to add another option (a fallback presentation), and set it up the same way. Delete an option with the **×** on its tab; the last remaining tab cannot be deleted. Drag a tab to reorder the options, or focus a tab and press **Alt + ←/→**. The order of the tabs is the order of preference in `layoutOptions`.
6. Choose the option to render with the dropdown in the Preview Player header. Clicking a tab also renders that tab.
7. Copy the generated output from the Data Preview.

### Default layouts

Viewports are written `top right bottom left`.

| adType | Primary content (viewport, zDepth) | Additional assets (id: viewport, zDepth) |
|---|---|---|
| customLayout (default) | not emitted (full frame, 0) | none; ADD ASSET adds adOverlayN: `0 75 75 0` |
| cornerOverlay | not emitted (full frame, 0) | adOverlay1: `0 75 75 0`, 1 |
| lowerThirdOverlay | not emitted (full frame, 0) | adOverlay1: `70 0 0 0`, 1 |
| squeezebackFrame | `20 20 20 20`, 1 | adOverlay1: `0 0 0 0`, 0 |
| squeezebackDoubleBox | `25 50 25 0`, 0 | adSideBySide: `25 0 25 50`, 1 |
| squeezebackLShape | `0 0 25 25`, 1 | lBackplate: `0 0 0 0`, 0 |
| squeezebackLShape-left | `0 25 25 0`, 1 | lBackplate: `0 0 0 0`, 0 |
| squeezebackLShape-2bars | `0 40 40 0`, 0 | adBarVertical: `0 0 0 60`, 1; adBarHorizontal: `60 0 0 0`, 2 |
| multiView | `0 50 50 0`, 0 | view2: `0 0 50 50`, 1; view3: `50 50 0 0`, 2; view4: `50 0 0 50`, 3 |

The three `squeezebackLShape` entries are forms of the same PresentationType, so all three write `"type": "squeezebackLShape"` in `layoutOptions` and `layoutMode` in DASH.
- **`squeezebackLShape`** (the default) and **`-left`** use a backplate: one full-frame underlay whose artwork forms the L, with the primary content scaled to the upper right or upper left (the reversed L) on top of it. This is how the IAB assumes squeezeback creatives are delivered, and it needs two concurrent video decoders.
- **`-2bars`** uses separate vertical and horizontal assets, so it needs three decoders when both bars are video.

### Volume

- **Additional assets** default to `0` (muted). `volume` is emitted only when it is not 0.
- **Primary content** has no default. Leave the field empty ("inherit") to keep the volume that is already playing; `volume` is then not emitted. A value you enter, including 100, is always emitted.

`primaryContent` is left out of the output entirely while it is full frame at zDepth 0 with no volume set.

## Output formats

### HLS (ASSET-LIST JSON)

The slot carries `start`, `duration` and `layoutOptions`. Slot identifiers are not generated, because they are not part of the layout. Each `layoutOptions` entry is a presentation option: a `type` (PresentationType) and a `layout` (`primaryContent` plus `assets`). There is one option per tab that has an adType, in tab order. A player presents the first option the device can render, and the type of that option becomes the type of the slot. Each option carries its own `primaryContent`, which is left out when it is full frame at zDepth 0 with no volume set.

```json
{
    "ASSETS": [{
        "URI": "[PATH TO ASSET]",
        "DURATION": 15.015,
        "X-AD-CREATIVE-SIGNALING": {
            "version": 2,
            "type": "slot",
            "payload": [{
                "start": 0,
                "duration": 15.015,
                "layoutOptions": [{
                    "type": "squeezebackLShape",
                    "layout": {
                        "primaryContent": { "zDepth": 1, "viewport": "0 0 25 25" },
                        "assets": [{
                            "id": "lBackplate",
                            "type": "image/svg+xml",
                            "uri": "/graphics/campaigns/zumbra-backplate-fijo.svg",
                            "viewport": "0 0 0 0",
                            "zDepth": 0
                        }]
                    }
                }]
            }]
        }
    }]
}
```

### DASH (MPD XML)

The output is an MPD with `type="non-linear"`. The DASH form carries a single option: the one selected in the Preview Player. It is written as one `svta:ConcurrentElements` whose `layoutMode` is the option's PresentationType. Inside are `svta:PrimaryContent` and `svta:Asset` elements, which follow the same viewport, zDepth and volume rules as the HLS output.

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── app.js              # Application logic (layout presets, form, preview, output)
├── server.js           # Node.js (Express) static server
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## References

- SVTA2053 – Ad Creative Signaling in DASH and HLS, v4 draft (HLS update): 4.2.3 Viewport, 4.4.8 AssetLayout, 4.4.9 SlotOption, 5.3 Concurrent Presentation
- IAB Tech Lab, [Ad Format Guidelines for Digital Video & CTV v2.0](https://github.com/InteractiveAdvertisingBureau/Ad-Format-Guidelines-for-Digital-Video-CTV/blob/main/v2.0.md)

## License

See LICENSE file for details.
