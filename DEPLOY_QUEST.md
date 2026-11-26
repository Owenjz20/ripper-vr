# Publish RIPPER VR for Quest 2

The headset needs the page to be served from HTTPS to enter immersive WebXR. This fixed build uses A-Frame 1.7’s `xr-mode-ui` component and calls the scene’s `enterVR()` method from the launch-button click. A Mac-only `http://localhost:8000` address works on the Mac, not on the headset.

## GitHub Pages route

1. Sign in to GitHub and create a new **public** repository, for example `ripper-vr`.
2. Extract `RIPPER_VR_ULTIMATE.zip` on your Mac.
3. Open the extracted folder in VS Code.
4. In the GitHub repository, choose **Add file → Upload files**.
5. Upload the project contents: `index.html`, `css/`, `js/`, `assets/`, `README.md`, and `PROJECT.txt`.
6. Commit the upload to the `main` branch.
7. Open repository **Settings → Pages**.
8. Under **Build and deployment**, choose **Deploy from a branch**.
9. Select branch `main` and folder `/ (root)`, then save.
10. Wait for GitHub Pages to publish the site. Copy the HTTPS URL shown on that page.
11. Open the HTTPS URL in Meta Quest Browser. Press **START + ENTER VR**. If the page remains flat, use the blue **ENTER VR** retry button at the bottom-right. The headset should change into immersive mode and track your head/controllers.

## Local desktop run

Open Terminal in VS Code, from the project folder, and run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` on the Mac.

## Common problems

- **Page is blank:** make sure the browser has internet access so it can load A-Frame from its CDN; check DevTools Console for errors.
- **Enter VR is missing or unavailable:** confirm the page is on HTTPS and open it in Meta Quest Browser.
- **Controller menu does not click:** ensure controller laser is visible and point directly at a flat menu button; try reloading the page after entering the published HTTPS site.
- **Frame rate drops:** clear loose pieces and spawned props, reduce target count, or turn enemy AI off in Settings.
