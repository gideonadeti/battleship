import UI from '../views/ui'

import clickMP3 from '../assets/sounds/click.mp3'
import clickOGG from '../assets/sounds/click.ogg'
import gameStartedMP3 from '../assets/sounds/game_started.mp3'
import gameStartedOGG from '../assets/sounds/game_started.ogg'
import killedMP3 from '../assets/sounds/killed.mp3'
import killedOGG from '../assets/sounds/killed.ogg'
import loseMP3 from '../assets/sounds/lose.mp3'
import loseOGG from '../assets/sounds/lose.ogg'
import missedMP3 from '../assets/sounds/missed.mp3'
import missedOGG from '../assets/sounds/missed.ogg'
import winMP3 from '../assets/sounds/win.mp3'
import winOGG from '../assets/sounds/win.ogg'
import woundedMP3 from '../assets/sounds/wounded.mp3'
import woundedOGG from '../assets/sounds/wounded.ogg'

const sounds = {
  click: {
    mp3: clickMP3,
    ogg: clickOGG
  },
  gameStarted: {
    mp3: gameStartedMP3,
    ogg: gameStartedOGG
  },
  killed: {
    mp3: killedMP3,
    ogg: killedOGG
  },
  lose: {
    mp3: loseMP3,
    ogg: loseOGG
  },
  missed: {
    mp3: missedMP3,
    ogg: missedOGG
  },
  win: {
    mp3: winMP3,
    ogg: winOGG
  },
  wounded: {
    mp3: woundedMP3,
    ogg: woundedOGG
  }
}

export default function playSound (soundName) {
  const audio = new Audio()
  if (audio.canPlayType('audio/mpeg')) {
    audio.src = sounds[soundName].mp3
  } else if (audio.canPlayType('audio/ogg')) {
    audio.src = sounds[soundName].ogg
  } else {
    console.error('Audio format not supported')
    return
  }
  if (UI.soundOn()) {
    audio.play()
  }
}
