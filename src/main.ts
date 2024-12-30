import { invoke } from "@tauri-apps/api/core";
import { Midi } from "@tonejs/midi";

const chartMidi = await fetch ("./src/assets/chart.mid").then (r => r.arrayBuffer());

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
	if (greetMsgEl && greetInputEl) {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		greetMsgEl.textContent = await invoke("greet", {
		name: greetInputEl.value,
		});
	}
}

window.addEventListener("DOMContentLoaded", () => {
	greetInputEl = document.querySelector("#greet-input");
	greetMsgEl = document.querySelector("#greet-msg");
	document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
		e.preventDefault();
		greet();
	});
});

(function init() {
	const parsedMidi = parseMidi (new Uint8Array(chartMidi));
	console.log (parsedMidi);
}());

function parseMidi (_midiBuffer: Uint8Array): Midi {
	const parsedMidi = new Midi (_midiBuffer);
	return parsedMidi;
}
