const RAW: string[] = [
  ...'🌸🌷🌹🌺🌻🌼💐🪻🪷🌿🍀🍃🍂🍁🌾🌵🌴🌲🍄🪴🌱🪺🪹',
  ...'🦋🐝🐞🐌🐛🐦🕊🦢🦉🦜🐰🐻🐼🐨🐱🐶🦊🐸🐢🦄🐠🐙🦔🐿🦌🐑',
  ...'🍓🍒🍑🍋🍊🍎🍐🍇🫐🍉🥝🍍🥭🍯🥐🍞🧇🥞🧁🍰🎂🍪🍩🍫🍬🍭☕🍵🧋🥛🍷🫖',
  ...'☀️🌙⭐🌟✨💫⚡☁️🌈❄️☔🌊🔥💧🌍🪐🌕🌖🌗🌘🌑',
  ...'💜💗💖💕💞💝💌🤍🤎🧡💛💚💙🩷🩵🖤❤️‍🔥🎀🎁🎈🎉🎊🪅',
  ...'📷📸🎞📽🎧🎵🎶🎤🎹🎸🎻📻📼💿📺☎️',
  ...'📖📚📓📔📒✏️🖋🖊🖌🖍📝📎📌📍✂️🗝🔑🔒🕯💡🔭🔮🧿🪄',
  ...'✉️📮📬🏷🎫🎟🗓📅⏳⌛⏰🕰',
  ...'🛍👒🎩👓🕶👗👠🩰💍💎👑🧸🪆🧶🧵🪡',
  ...'🗼🏰🗽🏔🏝🏕🚲🛶⛵✈️🚂🚌🚗🏡⛲🎡🎠',
  ...'😊🥰😍🤗😌😴🥹😎🤩🥳😇🙃😉🫶🤞🙏👏🤍🫧',
  ...'🧿🪬🔔🎯🏆🥇🎨🧩🎲♟🪁🛼⚽🏀🎾',
  ...'☺️🌤⛅🌦🌅🌄🌇🌆🌃🌌',
];

// Re-attach variation selectors and ZWJ sequences that spreading splits apart.
function group(chars: string[]): string[] {
  const out: string[] = [];
  let joinNext = false;
  for (const ch of chars) {
    if (out.length && (joinNext || ch === '\uFE0F' || ch === '\u200D')) {
      out[out.length - 1] += ch;
      joinNext = ch === '\u200D';
    } else {
      out.push(ch);
      joinNext = false;
    }
  }
  return Array.from(new Set(out));
}

export const EMOJI: string[] = group(RAW);
