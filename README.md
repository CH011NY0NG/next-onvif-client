# ONVIF Client Web Application

## Description

A web application for managing and interacting with ONVIF-compliant devices. This application allows users to connect, control, and monitor ONVIF-enabled devices directly from a web interface.

## Development

To start the development server:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:

   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`.

## Features

- Discover ONVIF-compliant devices
- Live video streaming (implemented using the `rtsp-ffmpeg` library)
- PTZ (Pan-Tilt-Zoom) control
- ONVIF functionality implemented using the `onvif` library
- List management with drag-and-drop functionality using `react-dnd` library:
  - Add devices and folders to organize in a hierarchical structure
  - Rearrange devices and folders by dragging and dropping

## Usage

- Discover ONVIF devices using the device discovery feature.
- Add devices or folders manually to create a hierarchical structure.
- Rearrange devices and folders by dragging and dropping them in the list.
- View basic information about each device.
- Stream live video from selected devices.
- Control device PTZ (Pan-Tilt-Zoom) functionality directly from the interface.

## Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **ONVIF Integration**: Node-ONVIF, `onvif` library
- **Streaming**: `rtsp-ffmpeg` library
