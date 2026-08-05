const fs = require('fs');

console.log('=== FIXING GLOBAL DEPENDENCIES ACROSS MODULES ===');

// 1. In js/audio.js: Ensure THEMES, playSound, sound effect helpers are all defined cleanly
let audioCode = fs.readFileSync('js/audio.js', 'utf8');

if (!audioCode.includes('const THEMES =')) {
    audioCode = `const THEMES = {
    fase1: 'audio/fase1_kleber.mp3',
    fase2: 'audio/fase2_gwen.mp3',
    fase3: 'audio/fase3_sam.mp3',
    fase4: 'audio/fase4_claudio.mp3',
    fase5: 'audio/fase5_felifep.mp3',
    fase6: 'audio/fase6_volibear.mp3',
    fase7: 'audio/fase7_warwick.mp3'
};\n` + audioCode;
    fs.writeFileSync('js/audio.js', audioCode, 'utf8');
    console.log('Fixed THEMES in js/audio.js');
}

// Check if index.js still exists or if we should maintain index.js as a clean unified fallback or load script
console.log('Checking index.html script tag order...');
