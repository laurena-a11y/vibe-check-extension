# Vibe Check Extension

A VS Code/Cursor extension that prevents developers from reinventing the wheel by comparing their code against existing design systems and pattern libraries.

## Description

Vibe Check analyzes your React components and compares them against your design system to detect when you're creating components that already exist. It helps maintain consistency and prevents duplicate work by suggesting existing patterns from your Figma files or web-based component libraries.

## Features

- **React/JSX Analysis**: Parses React components using Babel AST
- **Figma Integration**: Fetches components from Figma design files
- **Structural Matching**: Compares component structure, props, and element types
- **Confidence Scoring**: Shows match confidence (high/medium/low)
- **Detailed Reporting**: Lists match reasons and differences
- **On-Demand Checking**: Run analysis via command palette

## Installation & Setup

### 1. Install Dependencies

Due to network restrictions, you'll need to install dependencies when you have proper npm registry access:

```bash
cd ~/Projects/vibe-check-extension
npm install
```

### 2. Compile TypeScript

```bash
npm run compile
```

Or for watch mode during development:

```bash
npm run watch
```

### 3. Test the Extension

Press `F5` in VS Code to launch the Extension Development Host, or run:
- **Command Palette** → "Debug: Start Debugging"

## Usage

### Configure Pattern Libraries

1. Open Command Palette (`Cmd+Shift+P`)
2. Run: `Vibe Check: Configure Pattern Libraries`
3. Add your Figma file URL and access token

**Manual Configuration** (for now):

Edit VS Code settings (`settings.json`):

```json
{
  "vibeCheck.enabled": true,
  "vibeCheck.matchingThreshold": 70,
  "vibeCheck.patternLibraries": [
    {
      "id": "my-design-system",
      "name": "My Design System",
      "type": "figma",
      "enabled": true,
      "config": {
        "fileUrl": "https://www.figma.com/file/YOUR_FILE_KEY/...",
        "accessToken": "YOUR_FIGMA_TOKEN",
        "fileKey": "YOUR_FILE_KEY"
      }
    }
  ]
}
```

**Getting a Figma Access Token**:
1. Go to Figma → Account Settings → Personal Access Tokens
2. Generate a new token
3. Copy the token to your configuration

### Check Current File

1. Open a React/JSX/TSX file
2. Open Command Palette (`Cmd+Shift+P`)
3. Run: `Vibe Check: Check Current File`
4. View results in the "Vibe Check" output channel

## Configuration Settings

- `vibeCheck.enabled` - Enable/disable extension (default: `true`)
- `vibeCheck.matchingThreshold` - Minimum similarity score (0-100, default: `70`)
- `vibeCheck.matchingStrategy` - Matching strategy: `structural`, `semantic`, or `hybrid` (default: `hybrid`)
- `vibeCheck.patternLibraries` - Array of pattern library configurations

## Development

### Project Structure

```
src/
├── extension.ts              # Entry point
├── commands/                 # Command implementations
│   ├── checkCurrentFile.ts
│   ├── configurePatterns.ts
│   └── refreshCache.ts
├── parsers/
│   └── reactParser.ts       # Babel-based React parser
├── fetchers/
│   └── figmaFetcher.ts      # Figma API integration
├── matchers/
│   └── structuralMatcher.ts # Component matching logic
├── models/
│   ├── PatternLibrary.ts
│   ├── Component.ts
│   └── Match.ts
├── services/
│   └── configService.ts
└── utils/
    └── helpers.ts
```

### Building

```bash
npm run compile     # One-time compile
npm run watch       # Watch mode
```

### Testing

Press `F5` in VS Code to launch Extension Development Host.

### Future Roadmap

**Phase 2**: AI Semantic Matching
- Voyage AI embeddings for code similarity
- Claude API for match explanations
- More intelligent pattern detection

**Phase 3**: Web Scraping & Multi-Source
- Support any component library URL
- Storybook integration
- Multiple pattern library management

**Phase 4**: Polish & Advanced Features
- Code actions (quick fixes)
- Inline diagnostics
- Rich webview results panel
- Automatic code replacement

## Technologies

- **TypeScript** - Type-safe development
- **@babel/parser** - React/JSX parsing
- **Axios** - HTTP client for APIs
- **VS Code Extension API** - Extension framework

## Troubleshooting

### Network Issues

If you encounter npm registry blocks:
- Check your network/VPN settings
- Try a different network
- Contact your IT department about npm registry access

### Extension Not Activating

Make sure you've:
1. Compiled TypeScript (`npm run compile`)
2. Restarted Extension Development Host (stop and press F5 again)

### No Components Found

Ensure you're working with:
- React/JSX/TSX files
- Files containing actual React components (function or class components)

## Contributing

This is a work in progress! Current implementation includes:
- ✅ React/JSX parser
- ✅ Figma API integration
- ✅ Structural matching
- ⏳ Semantic matching (planned)
- ⏳ Web scraping (planned)
- ⏳ UI enhancements (planned)

## License

MIT
