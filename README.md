# SVTA-Non-Linear-Generator

A JavaScript-based web application to visualize non-linear video ad layouts using an extended version of the Apple HLS Interstitials Asset List JSON format.

## Features

- **Preview Player**: Visualize ad layouts with 16:9 aspect ratio player
- **Asset Form**: Add and configure overlay assets with full control over positioning, scaling, and padding
- **Asset List Preview**: Real-time JSON output following HLS Interstitials Asset List format
- **Live Updates**: See changes instantly as you modify asset properties

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

The server will run on port 3000 by default. You can change the port by setting the `PORT` environment variable.

## Usage

1. Select an `adType` from the dropdown (overlay, lowerThirdOverlay, squeezebackFrame, etc.)
2. Click "ADD ASSET" to add a new overlay asset
3. Fill in the asset properties:
   - **ID**: Unique identifier for the asset
   - **Type**: MIME type (HLS, MP4, PNG, JPEG)
   - **URI**: Path to the asset (required)
   - **anchorPosition**: Position anchor (topLeft, topRight, center, etc.)
   - **zDepth**: Z-index for layering
   - **volume**: Volume percentage (0-100)
   - **scale**: Scale percentage (0-100)
   - **horizontalPadding**: Horizontal padding percentage (-100 to 100)
   - **verticalPadding**: Vertical padding percentage (-100 to 100)
4. Watch the preview update in real-time
5. Copy the generated JSON from the Asset List Preview section

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── app.js              # Application logic
├── server.js           # Node.js server
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## License

See LICENSE file for details.
