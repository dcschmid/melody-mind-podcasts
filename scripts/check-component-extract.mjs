import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const audioComponent = resolve("src/components/AudioPlayer.astro");
if (!existsSync(audioComponent)) {
  fail("AudioPlayer component missing: src/components/AudioPlayer.astro");
}

const episodePage = readFileSync(resolve("src/pages/[id].astro"), "utf8");
if (!episodePage.includes("AudioPlayer")) {
  fail("AudioPlayer not used in src/pages/[id].astro");
}

if (episodePage.includes("episode-player__")) {
  fail("AudioPlayer markup still present in src/pages/[id].astro");
}

console.log("AudioPlayer extraction check passed.");
