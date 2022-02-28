import './style.css';
import { RaceGame } from '/3d/race/race_game.js'
import { createAsync } from '/3d/race/race_game.js'

const playButton = document.getElementById('play');
playButton.style.display = 'none';
playButton.style.visibility = 'invisible';

createAsync().then(
    game => {
        playButton.style.visibility = 'visible';
        playButton.style.display = 'block';
        playButton.onclick = () => {
            // Use to start or restart the race
            game.startRace();
        };

        // Use to draw models to the scene, call this when you prepare to start the race
        game.renderModels();

        // Called when the race starts, before refreshing models
        game.addEventListener('race_started', function(event) {
            alert(event.type);
        });
        
        // Called when the race ends, before resetting models
        game.addEventListener('race_ended', function(event) {
            alert(event.type);
        });

        // Called before race ends, when a horse reaches the last point in the raceway     
        game.addEventListener('horse_won', function(event) {
            alert(event.type.concat(' ', event.message));
        });

        // Called before rendering each frame, suitable place to update horse speed and other properties
        game.addEventListener('refresh_models', function(event) {
            game.raceHorses.forEach(element => {
                element.accelerationPercent = getRandomFloat(0.7, 1.25);
            });

            //Winner horse always faster
            game.raceHorses[1].accelerationPercent = getRandomFloat(0.715, 1.265);
        });
    }
);


function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}