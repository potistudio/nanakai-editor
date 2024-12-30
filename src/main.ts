import { invoke } from "@tauri-apps/api/core";
import { Midi } from "@tonejs/midi";

const chartMidi = await fetch ("./src/assets/C0.mid").then (r => r.arrayBuffer());

const FADER_COUNT = 5;
const BASE_MIDI_TAP = 0;
const BASE_MIDI_HOLD = 5;
const BASE_MIDI_FADER = 12;

type Note = {
	time: number,
	duration: number,
	velocity: number,
	pos: number,
};

type Midi = {
	barCount: number,
	duration: number,
	notes: Note[],
}

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

	console.log ({
		tapNotes: extractTapNotes (parsedMidi.notes),
		holdNotes: extractHoldNotes (parsedMidi.notes),
		faderEvents: extractFaderEvent (parsedMidi.notes),
	});
}());

function extractTapNotes (_midi: Note[]): Note[][] {
	let notes = [];

	for (let i = 0; i < FADER_COUNT; i++) {
		notes.push (_midi.filter (note => note.pos === BASE_MIDI_TAP + i));
	}

	return notes;
}

function extractHoldNotes (_notes: Note[]): Note[][] {
	let notes = [];

	for (let i = 0; i < FADER_COUNT; i++) {
		notes.push (_notes.filter (note => note.pos === BASE_MIDI_HOLD + i));
	}

	return notes;
}

function extractFaderEvent (_notes: Note[]): Note[][] {
	const FADER_TICK = 5;
	const faders: Note[][] = [];

	for (let i = 0; i < FADER_COUNT; i++) {
		const base = BASE_MIDI_FADER + i * FADER_TICK;
		faders.push (_notes.filter(note => note.pos >= base && note.pos < base + FADER_TICK));
	}

	return faders;
}

function parseMidi (_midiBuffer: Uint8Array): Midi {
	const parsedMidi = new Midi (_midiBuffer);

	const pulses = parsedMidi.header.ppq;  // 96
	const durationTicks = parsedMidi.durationTicks;  // 384
	const barCount = Math.ceil (durationTicks / pulses);  // 4
	const duration = parsedMidi.duration;  // bpm / 60 * barCount * 4
	const notes = parsedMidi.tracks[0].notes.map (note => {
		return {
			time: note.time,
			duration: note.duration,
			velocity: note.velocity,
			pos: note.midi,
		}
	});

	return {
		barCount,
		duration,
		notes,
	};
}
