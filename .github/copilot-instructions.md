# Copilot Instructions for Linebursdag

## Project Overview
This is a personal birthday web application - a simple, romantic single-page app with password protection that reveals a heartfelt message. The project uses vanilla HTML/CSS/JS with a focus on smooth animations and personal touches.

## Architecture & Key Components

### Security Pattern
- **Password protection**: Uses SHA-256 client-side hashing (stored hash: `PASSWORD_HASH` in `script.js`)
- **Two-screen flow**: Welcome screen → Journey screen (hidden until password is correct)
- Generate new password hash via browser console: `hashMessage("yourpassword")`

### Animation System
- **CSS transitions**: All screens use `opacity` and `transform: translateY()` for entrance effects
- **Screen management**: `.screen.active` class controls visibility with 1s ease transitions
- **Timing**: 800ms delay between hiding welcome and showing journey screen
- **State flow**: `active` class → `display: none` → new screen `display: block` → `active` class

### Styling Approach
- **CSS custom properties**: All colors defined in `:root` (primary: `#5b9071`, accent: `#f3cfc6`)
- **Norwegian minimalism**: Clean, centered design with soft colors and rounded corners
- **Responsive**: Uses relative units (`em`) and percentage widths for mobile-friendly design

## Development Patterns

### File Structure
- `index.html`: Single-page structure with two main sections
- `script.js`: Event handling and crypto functions
- `style.css`: Component-based styling with CSS variables
- `CNAME`: GitHub Pages deployment configuration

### Event Handling Pattern
```javascript
btn.addEventListener("click", async () => {
  // Hash input, compare with stored hash
  // If valid: trigger screen transition sequence
  // If invalid: show error, clear input
});
```

### Error Handling
- Visual feedback only (no console logging)
- `.hidden` class toggles error visibility
- Input is cleared on failed attempts

## Deployment & Hosting
- **GitHub Pages**: Uses `CNAME` file for custom domain
- **Static hosting**: No build process - direct file serving
- **Domain**: Configured for custom domain deployment

## Personal Context
This is a romantic gesture codebase - maintain the intimate, personal tone when making changes. The Norwegian-influenced design aesthetic (clean lines, natural colors) should be preserved.