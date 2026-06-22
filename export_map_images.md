# Exporting Map Images for Documentation

To export and save high-quality map images for documentation:

1. Open the HTML map (e.g., fragile_soil_index_map.html or organic_depletion_risk_map.html) in your browser.
2. Adjust the map view and zoom to the desired region.
3. Use your browser's built-in screenshot tool or a browser extension (e.g., "Full Page Screen Capture" for Chrome) to capture the map area.
4. Save the image as PNG or JPEG.
5. Place exported images in `docs/images/` or a similar documentation folder.
6. Reference these images in your markdown or HTML documentation as needed.

**Tip:** For reproducible, automated map exports, consider using Python with Selenium or a headless browser to script map rendering and screenshot capture.

---

Example Markdown usage:

```markdown
![Fragile Soil Index Map](../docs/images/fragile_soil_index_example.png)
```

---

For advanced automation, see the Python Selenium example in the project wiki.
