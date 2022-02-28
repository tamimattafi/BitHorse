import './style.css';
import { RaceGame } from '/ui/game/race_game.js'
import { createAsync } from '/ui/game/race_game.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const playButton = document.getElementById('play');
playButton.style.display = 'none';
playButton.style.visibility = 'invisible';

createAsync().then(
    game => {
        playButton.style.visibility = 'visible';
        playButton.style.display = 'block';
        playButton.onclick = () => {
            game.startRace();
        };

        game.renderModels();
        game.addEventListener('race_started', function(event) {
            alert(event.type);
            animate();
        });
        
        game.addEventListener('race_ended', function(event) {
            alert(event.type);
            cancelAnimationFrame(animate)
        });

             
        game.addEventListener('horse_won', function(event) {
            alert(event.type.concat(' ', event.message));
        });

        // animation loop
        function animate() {
            requestAnimationFrame(animate)
            game.refreshModels();
        }
    }
);