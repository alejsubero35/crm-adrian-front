// Setup test environment: ensure indexedDB and basic DOM are available
try {
	// Load fake-indexeddb (provides global indexedDB implementation)
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('fake-indexeddb/auto');
} catch (e) {
	// ignore if not installed
}

try {
	// Provide a minimal DOM via jsdom
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { JSDOM } = require('jsdom');
	const dom = new JSDOM('<!doctype html><html><body></body></html>');
	// assign globals for tests
	// @ts-expect-error: runtime assignment for test environment
	global.window = dom.window;
	// @ts-expect-error
	global.document = dom.window.document;
	// If fake-indexeddb didn't attach indexedDB, use dom's
	// @ts-expect-error
	if (!global.indexedDB && dom.window.indexedDB) {
		// @ts-expect-error
		global.indexedDB = dom.window.indexedDB;
	}
} catch (e) {
	// ignore if jsdom is not installed in environment
}
