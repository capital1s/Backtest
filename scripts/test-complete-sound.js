#!/usr/bin/env node
// Play a sound when called (cross-platform)
import { exec } from "child_process";

function playSound() {
  if (process.platform === "darwin") {
    exec("afplay /System/Library/Sounds/Glass.aiff");
  } else if (process.platform === "win32") {
    exec(
      'powershell -c (New-Object Media.SoundPlayer "C:/Windows/Media/Windows Ding.wav").PlaySync();',
    );
  } else {
    exec(
      'paplay /usr/share/sounds/freedesktop/stereo/complete.oga || aplay /usr/share/sounds/alsa/Front_Center.wav || echo "\\a"',
    );
  }
}

playSound();
