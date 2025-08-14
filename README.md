# Positional Encoding Visualizer

A 3D interactive visualization tool for understanding how positional encoding works in transformer architectures. This educational tool demonstrates the mathematical relationships between token positions and their high-dimensional embeddings through immersive 3D graphics.

## Overview

Positional encoding is a fundamental component of transformer models that allows them to understand the sequential order of input tokens. This visualizer transforms abstract mathematical concepts into intuitive 3D representations, making it easier to understand how position information is encoded in high-dimensional space.

## Features

### Core Functionality

- **3D Positional Encoding Visualization**: Renders tokens as 3D text objects positioned according to their positional encoding vectors
- **Interactive Text Input**: Real-time visualization of custom sentences with dynamic tokenization
- **Configurable Embedding Dimensions**: Support for embedding dimensions from 4 to 256 (must be even)
- **Mathematical Accuracy**: Implements the standard transformer positional encoding formula:
  ```
  PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
  PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
  ```

### Visual Components

- **3D Coordinate System**: Custom axes with bidirectional arrows showing X (red), Y (green), Z (blue) dimensions
- **Token Representation**: 3D text meshes aligned with their positional encoding direction vectors
- **Direction Arrows**: Color-coded arrows indicating the direction of each token's positional encoding vector
- **Grid Planes**: Semi-transparent reference planes (XY, XZ, YZ) for spatial orientation
- **Connection Lines**: Visual connections from arrow tips to the world origin
- **Dynamic Camera**: Automatic camera positioning based on token distribution

### Technical Implementation

#### Architecture

- **Frontend Only**: Pure client-side implementation using vanilla JavaScript
- **WebGL Rendering**: Three.js-powered 3D graphics with hardware acceleration
- **Responsive Design**: Tailwind CSS for modern, responsive UI components
- **Font Loading**: Dynamic 3D font loading for text geometry generation

#### Core Components

##### 1. Positional Encoding Engine (`script.js:370-384`)

Implements the mathematical foundation with precise adherence to transformer specifications:

```javascript
function calculatePositionalEncoding(numTokens, dModel) {
  for (let pos = 0; pos < numTokens; pos++) {
    for (let i = 0; i < dModel / 2; i++) {
      const divTerm = Math.pow(10000, (2 * i) / dModel);
      const angle = pos / divTerm;
      pe[pos][2 * i] = Math.sin(angle);
      pe[pos][2 * i + 1] = Math.cos(angle);
    }
  }
}
```

##### 2. 3D Scene Management (`script.js:35-130`)

- **Scene Setup**: Configurable lighting, camera, and rendering pipeline
- **Memory Management**: Proper disposal of 3D objects to prevent memory leaks
- **Shadow System**: Realistic shadow casting for enhanced depth perception
- **Performance Optimization**: Efficient rendering loop with requestAnimationFrame

##### 3. Token Visualization System (`script.js:407-568`)

- **Spatial Positioning**: Maps first 3 PE dimensions to XYZ coordinates with scaling
- **Text Alignment**: Sophisticated quaternion-based text orientation along PE direction vectors
- **Color Coding**: RGB color mapping based on positional encoding values
- **Arrow Rendering**: Dynamic arrow helpers showing PE vector directions

##### 4. Interactive Controls (`index.html:11-36`)

- **Text Input**: Multi-line textarea for sentence input with real-time processing
- **Dimension Control**: Numeric input with validation for embedding dimensions
- **Visualization Trigger**: Button-based rendering with loading state management

#### Rendering Pipeline

1. **Tokenization**: Simple whitespace-based token splitting
2. **PE Calculation**: Mathematical computation of positional encoding matrix
3. **3D Mapping**: Transform PE vectors into 3D coordinates and orientations
4. **Scene Construction**: Create 3D objects (text, arrows, lines) in the scene
5. **Camera Adjustment**: Automatic camera positioning for optimal viewing
6. **Render Loop**: Continuous rendering with orbit controls

### User Interface

#### Control Panel (`styles.css:18-95`)

- **Fixed Positioning**: Always accessible controls with semi-transparent background
- **Monospace Typography**: Consistent with technical/programming theme
- **Responsive Layout**: Flexbox-based layout with proper spacing
- **Custom Scrollbar**: Styled scrollbar for overflow handling

#### Feedback System (`styles.css:96-112`)

- **Message Box**: Temporary notifications for errors and status updates
- **Color-Coded Alerts**: Red for errors, green for success messages
- **Fade Transitions**: Smooth opacity animations for better UX

## Usage

### Basic Usage

1. Open `index.html` in a modern web browser
2. Enter a sentence in the text area (default: "The quick brown fox jumps over the lazy dog")
3. Adjust the embedding dimension (d_model) if desired
4. Click "Visualize" to generate the 3D representation

### Understanding the Visualization

- **Token Position**: Each word appears as 3D text at coordinates determined by its positional encoding
- **Arrow Direction**: Shows the direction of the positional encoding vector in high-dimensional space
- **Color Coding**: Arrow colors reflect the PE values (RGB mapping)
- **Spatial Relationships**: Tokens with similar positions have related spatial arrangements

### Navigation

- **Mouse Orbit**: Drag to rotate around the scene
- **Zoom**: Scroll wheel to zoom in/out
- **Pan**: Right-click drag to pan the view

## Technical Requirements

### Browser Compatibility

- **WebGL Support**: Required for Three.js rendering
- **ES6+ Features**: Modern JavaScript features used throughout
- **External Dependencies**: CDN-based loading of required libraries

### Dependencies

- **Three.js r128**: 3D graphics engine and utilities
- **Tailwind CSS**: Utility-first CSS framework via CDN
- **Font Assets**: Droid Sans Mono for 3D text rendering

### Performance Considerations

- **Memory Management**: Explicit geometry and material disposal
- **Rendering Optimization**: Efficient render loop with orbit controls
- **Scalability**: Tested with embedding dimensions up to 256

## Educational Value

This tool is particularly valuable for:

- **Machine Learning Students**: Understanding positional encoding concepts
- **Transformer Architecture Research**: Visualizing how position affects embeddings
- **3D Programming Education**: Example of mathematical visualization in WebGL
- **Interactive Learning**: Hands-on exploration of abstract concepts

## File Structure

```
positional-encoding-viz/
├── index.html          # Main HTML structure and Three.js imports
├── script.js           # Core JavaScript logic and 3D rendering
├── styles.css          # CSS styling and responsive design
└── README.md           # Project documentation
```

The project follows a simple, self-contained architecture with clear separation of concerns between structure (HTML), behavior (JavaScript), and presentation (CSS).
