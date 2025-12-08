# Geofencing Feature - Quick Start Guide

## What's New? 🎉

The attendance system now includes **Geofencing** - a location-based security feature that ensures employees can only check in/out from authorized locations using OpenStreetMap.

## Key Features

✅ **Interactive Maps** - Real-time OpenStreetMap integration  
✅ **Location Verification** - GPS-based position tracking  
✅ **Automatic Enforcement** - Check-in buttons disabled outside allowed areas  
✅ **Multi-Center Support** - Separate geofences for each center  
✅ **Admin Control** - Complete customization of coordinates and radius  

## Quick Setup (Admin)

1. **Login** as admin
2. Go to **Settings** → **Geofence** tab
3. **Enable** geofencing toggle
4. **Set coordinates** for each center:
   - Get coordinates from Google Maps (right-click → "What's here?")
   - Enter Latitude & Longitude
   - Set radius in meters (default: 200m)
5. **Preview** on map
6. **Save** settings

## How It Works (Employee)

1. Employee opens dashboard
2. Browser requests location permission → **Allow**
3. Map shows current location
4. System checks if inside allowed area:
   - ✅ **Inside**: Green indicator + buttons enabled
   - ❌ **Outside**: Red indicator + buttons disabled
5. Check-in/out records include GPS coordinates

## Default Coordinates

**Makkah, Saudi Arabia** (Example - please update):
- American Center: 21.3891, 39.8579 (200m radius)
- European Center: 21.3920, 39.8600 (200m radius)
- Main Center: 21.3850, 39.8550 (200m radius)

⚠️ **Important**: Update these to your actual center locations!

## Technical Details

- **Technology**: Leaflet.js + OpenStreetMap
- **Distance Calculation**: Haversine formula
- **Accuracy**: GPS-based (5-50m typical)
- **Privacy**: Location saved only during check-in/out
- **Offline**: Requires internet for maps

## Files Added

- `src/components/GeofenceMap.tsx` - Interactive map component
- `src/components/GeofenceSettingsView.tsx` - Admin settings panel
- `src/lib/types.ts` - Updated with geofence types
- `GEOFENCE_FEATURE.md` - Detailed documentation (Arabic)
- `GEOFENCE_USER_GUIDE_AR.md` - User guide (Arabic)

## Troubleshooting

**Buttons not working?**
- Ensure location permission is granted
- Wait for GPS to stabilize
- Check admin set correct coordinates
- Verify radius is appropriate

**Map not loading?**
- Check internet connection
- Clear browser cache
- Try different browser

## Next Steps

1. ✅ Update center coordinates to actual locations
2. ✅ Test at each physical location
3. ✅ Train employees on location permission
4. ✅ Adjust radius based on building size

---

Built with ❤️ using open source tools: Leaflet + OpenStreetMap
