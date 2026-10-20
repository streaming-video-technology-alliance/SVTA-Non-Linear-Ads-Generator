# SVTA-Non-Linear-Generator

A JavaScript web application (the SVTA Non-Linear Ads Generator, or Layout Controller) that previews concurrent ("non-linear") video ad layouts and generates the matching signaling payloads. It follows the concurrent presentation model of **SVTA2053 – Ad Creative Signaling in DASH and HLS (v4 draft, HLS update)**, which aligns with the formats of the **IAB Tech Lab Ad Format Guidelines for Digital Video & CTV v2.0**.

## Features

- **Preview Player**: Renders the layout over a 16:9 player area. Size it by dragging, by typing width × height, or with the 1920×1080 preset, and lock it at that size.
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

1. Select an `adType`. For `squeezebackLShape`, also choose the **layout** variant (see below).
2. Click **ADD ASSET**. The first click adds the default assets for the selected adType. Each later click adds one corner-overlay asset.
3. Edit the asset properties:
   - **ID**: Identifier of the element, unique within the layout
   - **Type**: IANA media type (HLS, DASH, MP4, PNG, JPEG, SVG). `image/*` is rendered as an image; any other type is rendered as a media stream.
   - **URI**: Location of the asset (required)
   - **viewport**: `top right bottom left`, each an inset in % (0–100) from the same edge of the player area. `0 0 0 0` is full frame; `0 75 75 0` is the top-left quarter.
   - **zDepth**: Stacking order; higher values are drawn on top
   - **volume**: Initial volume, 0–100
4. Optionally expand **Primary Content** to change its viewport, zDepth or volume.
5. Copy the generated output from the Data Preview.

### Default layouts

Viewports are written `top right bottom left`.

| adType | Primary content (viewport, zDepth) | Additional assets (id: viewport, zDepth) |
|---|---|---|
| cornerOverlay | not emitted (full frame, 0) | adOverlay1: `0 75 75 0`, 1 |
| lowerThirdOverlay | not emitted (full frame, 0) | adOverlay1: `70 0 0 0`, 1 |
| squeezebackFrame | `20 20 20 20`, 1 | adOverlay1: `0 0 0 0`, 0 |
| squeezebackDoubleBox | `25 50 25 0`, 0 | adSideBySide: `25 0 25 50`, 1 |
| squeezebackLShape — backplate (default) | `0 0 25 25`, 1 | lBackplate: `0 0 0 0`, 0 |
| squeezebackLShape — two bars | `0 40 40 0`, 0 | adBarVertical: `0 0 0 60`, 1; adBarHorizontal: `60 0 0 0`, 2 |
| multiView | `0 50 50 0`, 0 | view2: `0 0 50 50`, 1; view3: `50 50 0 0`, 2; view4: `50 0 0 50`, 3 |

The `squeezebackLShape` **backplate** is one full-frame underlay whose artwork forms the L, with the primary content scaled to the upper right on top of it. This is how the IAB assumes squeezeback creatives are delivered. It needs two concurrent video decoders. The **two bars** form uses separate vertical and horizontal assets, so it needs three decoders when both bars are video.

### Volume

- **Additional assets** default to `0` (muted). `volume` is emitted only when it is not 0.
- **Primary content** has no default. Leave the field empty ("inherit") to keep the volume that is already playing; `volume` is then not emitted. A value you enter, including 100, is always emitted.

`primaryContent` is left out of the output entirely while it is full frame at zDepth 0 with no volume set.

## Output formats

### HLS (ASSET-LIST JSON)

The layout is carried in the slot's `layoutOptions` array. Each entry is a presentation option: a `type` (the adType) and a `layout` (`primaryContent` plus `assets`). The generator emits one option, for the selected adType. A player presents the first option the device can render, and the type of that option becomes the type of the slot.

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

The output is an MPD with `type="non-linear"`. It contains a single `svta:ConcurrentElements` (`layoutMode` = adType) with `svta:PrimaryContent` and `svta:Asset` elements. These follow the same viewport, zDepth and volume rules as the HLS output.

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
