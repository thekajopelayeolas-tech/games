(() => {
    const state = { scene: null, sounds: [], name: '', step: 0, overlay: null, progress: null, title: null, body: null, back: null, next: null };
    const lessons = [
        {
            title: 'Welcome to the scene viewer',
            body: name => 'You are viewing “' + name + '”. This page previews one scene from the Space Arcade collection. Look around and explore the artwork.'
        },
        {
            title: 'Look around',
            body: () => 'Use the arrow keys to move the camera. On a touchscreen, swipe across the scene or tap the direction buttons to pan around.'
        },
        {
            title: 'Try the sound effects',
            body: () => state.sounds.length
                ? 'Press number keys 1–' + Math.min(state.sounds.length, 9) + ' to play the scene’s sounds. On a phone or tablet, tap the numbered sound buttons.'
                : 'This scene has no individual sound effects. If it has music, tap once anywhere to allow the browser to start audio.'
        },
        {
            title: 'What is in the scene?',
            body: () => 'Background art, tile layers, animated characters, decorations, and interface labels are shown as designed. Some art moves on its own while you pan the camera.'
        },
        {
            title: 'Ready to explore?',
            body: () => 'You can reopen this guide with the Tutorial button. Use your browser’s Back button to return to the Space Arcade and choose another game.'
        }
    ];

    function addStyles() {
        if (document.getElementById('scene-tutorial-styles')) return;
        const style = document.createElement('style');
        style.id = 'scene-tutorial-styles';
        style.textContent = `
            #scene-tutorial-help, #scene-tutorial-controls, #scene-tutorial-sounds, #scene-tutorial-overlay { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
            #scene-tutorial-help { position: fixed; z-index: 5000; top: max(12px, env(safe-area-inset-top)); left: max(12px, env(safe-area-inset-left)); min-height: 44px; padding: 10px 16px; border: 1px solid #70defc; border-radius: 12px; background: #091a35eF; color: #f0fbff; font-size: 15px; font-weight: 800; box-shadow: 0 0 18px #38bde444; touch-action: manipulation; }
            #scene-tutorial-overlay { position: fixed; inset: 0; z-index: 6000; display: grid; place-items: center; padding: 18px; background: #020816d9; color: #eef7ff; }
            #scene-tutorial-overlay[hidden] { display: none; }
            .scene-tutorial-card { width: min(600px, 100%); padding: clamp(22px, 5vw, 42px); border: 2px solid #54d9ff; border-radius: 22px; background: linear-gradient(145deg, #10254b, #081329); box-shadow: 0 20px 70px #0009, 0 0 34px #28caff26; }
            .scene-tutorial-kicker { margin: 0 0 12px; color: #8deaff; font-size: 12px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
            .scene-tutorial-card h1 { margin: 0 0 22px; font-size: clamp(24px, 5vw, 36px); line-height: 1.12; text-shadow: 0 0 18px #4bcfff55; }
            .scene-tutorial-card p { min-height: 96px; margin: 0; color: #d0def3; font-size: clamp(16px, 2.8vw, 19px); line-height: 1.65; }
            .scene-tutorial-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 28px; }
            .scene-tutorial-actions button, .scene-tutorial-pad button, .scene-tutorial-sound { min-height: 46px; border: 1px solid #52cdef; border-radius: 12px; background: #12365b; color: #f2fbff; font-size: 15px; font-weight: 800; touch-action: manipulation; }
            .scene-tutorial-actions button { flex: 1; padding: 10px 14px; }
            .scene-tutorial-actions button:disabled { opacity: .42; }
            #scene-tutorial-controls { position: fixed; z-index: 4000; bottom: max(16px, env(safe-area-inset-bottom)); left: max(16px, env(safe-area-inset-left)); display: none; }
            .scene-tutorial-pad { display: grid; grid-template-columns: repeat(3, 48px); grid-template-rows: repeat(2, 46px); gap: 5px; }
            .scene-tutorial-pad button { font-size: 19px; }
            .scene-tutorial-pad button[data-dir="up"] { grid-column: 2; grid-row: 1; }
            .scene-tutorial-pad button[data-dir="left"] { grid-column: 1; grid-row: 2; }
            .scene-tutorial-pad button[data-dir="down"] { grid-column: 2; grid-row: 2; }
            .scene-tutorial-pad button[data-dir="right"] { grid-column: 3; grid-row: 2; }
            #scene-tutorial-sounds { position: fixed; z-index: 4000; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); display: none; flex-wrap: wrap; justify-content: flex-end; gap: 7px; max-width: min(240px, 48vw); }
            .scene-tutorial-sound { width: 46px; padding: 4px; }
            @media (pointer: coarse) { #scene-tutorial-controls, #scene-tutorial-sounds { display: flex; } }
            @media (max-width: 440px) { .scene-tutorial-actions { flex-direction: column-reverse; } .scene-tutorial-card p { min-height: 130px; } }
        `;
        document.head.appendChild(style);
    }

    function ensureUi() {
        addStyles();
        if (state.overlay) return;

        const help = document.createElement('button');
        help.id = 'scene-tutorial-help';
        help.type = 'button';
        help.textContent = '? Tutorial';
        help.setAttribute('aria-label', 'Open scene tutorial');
        help.addEventListener('click', openGuide);
        document.body.appendChild(help);

        const overlay = document.createElement('div');
        overlay.id = 'scene-tutorial-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'scene-tutorial-title');
        overlay.innerHTML = `
            <section class="scene-tutorial-card">
                <p class="scene-tutorial-kicker" id="scene-tutorial-progress"></p>
                <h1 id="scene-tutorial-title"></h1>
                <p id="scene-tutorial-body"></p>
                <div class="scene-tutorial-actions">
                    <button id="scene-tutorial-back" type="button">← Back</button>
                    <button id="scene-tutorial-next" type="button">Next →</button>
                </div>
            </section>`;
        document.body.appendChild(overlay);
        state.overlay = overlay;
        state.progress = overlay.querySelector('#scene-tutorial-progress');
        state.title = overlay.querySelector('#scene-tutorial-title');
        state.body = overlay.querySelector('#scene-tutorial-body');
        state.back = overlay.querySelector('#scene-tutorial-back');
        state.next = overlay.querySelector('#scene-tutorial-next');
        state.back.addEventListener('click', () => changeStep(-1));
        state.next.addEventListener('click', () => {
            if (state.step >= lessons.length - 1) closeGuide();
            else changeStep(1);
        });
        overlay.addEventListener('click', event => {
            if (event.target === overlay) closeGuide();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !state.overlay.hidden) closeGuide();
        });

        const controls = document.createElement('div');
        controls.id = 'scene-tutorial-controls';
        controls.innerHTML = '<div class="scene-tutorial-pad" aria-label="Touch camera controls"><button type="button" data-dir="up" aria-label="Pan up">▲</button><button type="button" data-dir="left" aria-label="Pan left">◀</button><button type="button" data-dir="down" aria-label="Pan down">▼</button><button type="button" data-dir="right" aria-label="Pan right">▶</button></div>';
        controls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => pan(button.dataset.dir)));
        document.body.appendChild(controls);

        const soundControls = document.createElement('div');
        soundControls.id = 'scene-tutorial-sounds';
        soundControls.setAttribute('aria-label', 'Scene sound effects');
        document.body.appendChild(soundControls);
    }

    function renderStep() {
        const lesson = lessons[state.step];
        state.progress.textContent = 'Scene guide · Step ' + (state.step + 1) + ' of ' + lessons.length + ' · ' + state.name;
        state.title.textContent = lesson.title;
        state.body.textContent = lesson.body(state.name);
        state.back.disabled = state.step === 0;
        state.next.textContent = state.step === lessons.length - 1 ? 'Start exploring ✓' : 'Next →';
    }

    function changeStep(delta) {
        state.step = Math.max(0, Math.min(lessons.length - 1, state.step + delta));
        renderStep();
    }

    function openGuide() {
        state.step = 0;
        renderStep();
        state.overlay.hidden = false;
    }

    function closeGuide() {
        state.overlay.hidden = true;
    }

    function pan(direction) {
        if (!state.scene || !state.scene.cameras || !state.scene.cameras.main) return;
        const camera = state.scene.cameras.main;
        const step = 44;
        if (direction === 'left') camera.scrollX -= step;
        if (direction === 'right') camera.scrollX += step;
        if (direction === 'up') camera.scrollY -= step;
        if (direction === 'down') camera.scrollY += step;
    }

    function setSoundButtons() {
        const soundControls = document.getElementById('scene-tutorial-sounds');
        if (!soundControls) return;
        soundControls.replaceChildren();
        state.sounds.slice(0, 9).forEach((sound, index) => {
            const button = document.createElement('button');
            button.className = 'scene-tutorial-sound';
            button.type = 'button';
            button.textContent = String(index + 1);
            button.setAttribute('aria-label', 'Play sound ' + (index + 1));
            button.addEventListener('click', () => {
                if (state.scene && sound) state.scene.sound.play(sound);
            });
            soundControls.appendChild(button);
        });
    }

    window.installSceneViewerTutorial = (scene, sounds, gameName) => {
        state.scene = scene;
        state.sounds = sounds || [];
        state.name = gameName || 'Arcade scene';
        ensureUi();
        setSoundButtons();
        if (!scene.__sceneTutorialInstalled) {
            scene.__sceneTutorialInstalled = true;
            let dragging = false;
            let previous = { x: 0, y: 0 };
            scene.input.on('pointerdown', pointer => {
                dragging = true;
                previous = { x: pointer.x, y: pointer.y };
            });
            scene.input.on('pointerup', () => { dragging = false; });
            scene.input.on('pointerupoutside', () => { dragging = false; });
            scene.input.on('pointermove', pointer => {
                if (!dragging || !pointer.isDown) return;
                scene.cameras.main.scrollX -= pointer.x - previous.x;
                scene.cameras.main.scrollY -= pointer.y - previous.y;
                previous = { x: pointer.x, y: pointer.y };
            });
        }
        openGuide();
    };
})();
