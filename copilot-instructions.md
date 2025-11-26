# Heritage Canvas - AI Coding Instructions

## Project Overview
Heritage Canvas is an interactive map-based web application showcasing Indian heritage sites. Users explore monuments, arts, cuisine, traditions, and epic tales through a filterable, time-based visualization using Leaflet.js.

**Tech Stack:** Vanilla JavaScript, Leaflet.js, HTML/CSS (no build tools, runs directly in browser)

## Architecture & Data Flow

### Core Components
- **`index.html`**: Single-page app with embedded CSS. All UI elements defined here (sidebar, map, timeline, details panel)
- **`script.js`**: Main application logic handling map initialization, filtering, search, and user interactions
- **`data.json`**: Array of heritage site objects with coordinates, category, year, details, and images
- **`filters/`**: Category-specific marker icons (PNG files matching category names)
- **`images/`**: Site photos referenced in `data.json` via `image_url` field

### Data Structure
Each site in `data.json` follows this schema:
```json
{
  "name": "Site Name",
  "coords": [lat, lng],
  "category": "monuments_and_architecture",  // matches filter button data-theme
  "year": 1653,                              // for timeline filtering
  "info": "Brief description",
  "details": "Extended content for details sidebar",
  "image_url": "images/site.jpg",
  "epic": "ramayan"                          // optional, for tales_and_epics subcategory
}
```

## Key Features & Implementation

### Filtering System
- **Categories**: 8 main themes (`monuments_and_architecture`, `folk_arts_and_handcrafts`, `cuisine`, `music_and_dance`, `festivals_and_traditions`, `spiritual_and_pilgrimage`, `nature_and_wildlife`, `tales_and_epics`)
- **Epic Subfilters**: `tales_and_epics` expands to show Ramayan/Harivamsa/Mahabharat buttons
- Filter buttons have `data-theme` attribute matching category values
- Subfilter buttons use `data-epic` attribute matching the `epic` field in data

### Timeline Mechanism
- Range slider (year 400-2025) filters sites by `year <= activeYear`
- Sites appear progressively as timeline advances forward
- All filters work cumulatively (theme + year + search)

### Marker System
- Custom icons from `filters/` directory based on category
- Icon URLs map in `iconUrls` object using category as key
- Markers created via `createMarker()` function with custom L.icon configuration
- Marker size: 36x42px, anchor at bottom center (18, 42)

### Details Sidebar
- Opens when clicking marker popup name/image (NOT on marker click directly)
- Popup content includes clickable elements that trigger `displayDetails(item)`
- Close via X button, clicking sidebar background, or opening another marker
- Shows full site info: image, name, year, info, and extended details

### Search Functionality
- Debounced input (300ms delay) to avoid excessive filtering
- Searches across: name, info, details, category, and year fields
- Case-insensitive, works alongside theme and year filters
- Clear button resets search without affecting other filters

## Development Conventions

### Sidebar Behavior
- Collapsed: 80px width (icon-only buttons)
- Expanded: 340px width (full text visible)
- Map margin adjusts dynamically on toggle with 360ms CSS transition
- Call `map.invalidateSize()` after transitions to refresh Leaflet rendering

### CSS Custom Properties
Key variables in `:root`:
- `--sidebar-collapsed-width: 80px`
- `--sidebar-expanded-width: 340px`
- `--accent: #3498db`

### Error Handling Patterns
- Image loading uses `onerror` handlers to hide broken images
- `data.json` fetch errors display user-facing notification (red banner, 5s timeout)
- Console logging for debugging (search "console.log" to trace state changes)
- Ensure `details` field exists for all sites (fallback in data load)

## Adding New Content

### New Heritage Site
1. Add entry to `data.json` with required fields (name, coords, category, year, info)
2. Add image to `images/` directory
3. Set `image_url` path relative to root
4. For epic tales, include `epic: "ramayan|harivamsa|mahabharat"`

### New Category
1. Add PNG icon to `filters/` with category name (e.g., `new_category.png`)
2. Add entry to `iconUrls` object in `script.js`
3. Create filter button in `index.html` with `data-theme="new_category"`
4. Update sites in `data.json` with new category value

### Image Assets
- Site images: `images/[site_name].jpg`
- Epic-specific images: `images/[Epic_Name]/[site].jpg` (e.g., `images/Harivamsa/`)
- Filter icons: `filters/[category].png` (exact category name match required)

## Testing Workflow
**No build step required** - open `index.html` directly in browser or use local server:
```powershell
# Python 3
python -m http.server 8000

# Node.js (if http-server installed)
npx http-server -p 8000
```

Access at `http://localhost:8000/index.html`

### Common Issues
- **Markers not showing**: Check browser console for data.json load errors, verify coords format `[lat, lng]`
- **Icons missing**: Ensure category name exactly matches PNG filename in `filters/`
- **Sidebar not opening**: Verify all detail elements exist (detailsSidebar, detailsName, etc.)
- **Search not working**: Check `searchInput` element ID matches script references

## External Dependencies
- Leaflet.js 1.9.4 (CDN loaded in `index.html`)
- Font Awesome 6.5.2 (icons for UI buttons)
- Google Fonts: Playfair Display, Poppins
- CartoDB basemap tiles (light theme)

## File Organization
```
Heritage/
├── index.html          # Main UI, all CSS embedded
├── script.js           # Application logic
├── data.json           # Heritage sites database
├── filters/            # Category marker icons
├── images/             # Site photos (organized by epic for tales_and_epics)
└── script_backup.js    # Version backup (inactive)
```

**Note**: `script_backup.js` exists but is not loaded - verify changes in `script.js` only.
