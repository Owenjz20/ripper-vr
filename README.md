# RIPPER VR — Ultimate Sandbox Prototype

A modular, browser-based A-Frame/WebXR physics sandbox built for Meta Quest 2 and desktop testing. This project is designed to be opened and edited in Visual Studio Code on an Intel Mac.

## Included systems

- WebXR scene, headset tracking and left/right controller laser pointers
- Desktop WASD movement, mouse look, keyboard weapon selection, reload, pause and drop controls
- Procedural stylized humanoid targets with separate torso, head, upper/lower limbs and simple joint animation
- Basic enemy pursuit and close-range attacks against the player
- Spawn menu, wave spawning, enemy cap, AI toggle, health reset and clear-target controls
- Machete, sword, axe, pistol, shotgun and rifle props
- Weapon equipping, spawned weapon pickups, grip-to-grab and grip-to-drop
- Melee swept-segment hit checks; limb-segment split into attached and detached sections; head and body-part separation
- Gun ray checks, ammo magazines, reserve ammo and reload
- Crates, barrels and spheres that can be spawned and picked up
- Detached object gravity, floor bounce and simple particle effects
- Procedural sound effects using Web Audio
- Local settings persistence for configurable values

## Install / run on Mac

1. Extract `RIPPER_VR_ULTIMATE.zip`.
2. Open the extracted `RIPPER_VR_ULTIMATE` folder in Visual Studio Code.
3. Choose **Terminal → New Terminal**.
4. Run:

   ```bash
   python3 -m http.server 8000
   ```

5. Open `http://localhost:8000` in a desktop browser.
6. Press **ENTER SANDBOX**.

## Run on Quest 2

Immersive WebXR requires a secure context (HTTPS, or localhost during local development). The scene uses A-Frame 1.7-compatible `xr-mode-ui`; the start button also calls `scene.enterVR()` directly from the user click. The Mac's `localhost` address is not accessible as `localhost` from the headset.

1. Upload the *contents* of this folder to a static HTTPS host, such as GitHub Pages.
2. Open the published HTTPS URL in Meta Quest Browser.
3. Press **ENTER SANDBOX**, then enter VR with the headset's VR button.
4. Use the controller laser and trigger to activate menu buttons.
5. Move the right controller to swing a melee weapon. Grip near a spawned weapon or prop to pick it up; grip again to drop it.

## Controls

### Desktop

- `W A S D`: move
- Mouse: look
- Left mouse: swing / fire (hide the in-world menu first)
- `E`: show or hide menu
- `1` machete, `2` sword, `3` axe, `4` pistol, `5` shotgun, `6` rifle
- `G`: drop the currently held weapon
- `R`: reload firearm
- `P`: pause / resume
- `H`: restore player health

### Quest 2

- Right trigger: select menu buttons or attack / fire while the menu is hidden
- Grip: pick up a nearby spawned weapon or prop; grip again to drop it
- Physical controller movement: melee blade movement

## Project structure

```text
RIPPER_VR_ULTIMATE/
├── index.html
├── README.md
├── PROJECT.txt
├── css/
│   └── style.css
├── js/
│   ├── core.js
│   ├── physics.js
│   ├── characters.js
│   ├── weapons.js
│   ├── props.js
│   ├── menu.js
│   └── main.js
└── assets/
```

## Honest prototype limits

This is a playable prototype foundation, not a completed commercial game. It does not yet have imported realistic humanoid GLB models, professional motion-captured animation, pathfinding, a full skeletal ragdoll solver, arbitrary polygon clipping across skinned meshes, gore, realistic firearm ballistics, multiplayer, save slots, or a finished options screen. Partial cuts work on the simple procedural cylinder limb segments; they are not general-purpose cuts through arbitrary models. Detached sections use lightweight gravity and bounce simulation rather than a full rigid-body engine. Controller input and immersive WebXR support should be verified on the exact Quest Browser version being used.

## Quest performance

Keep the active target count modest. Clear loose objects regularly. The project uses low-detail procedural geometry but still needs on-device performance testing. The A-Frame library is loaded from its CDN, so internet is required when loading the page.
