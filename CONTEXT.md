# Wordbook Exporter

This context describes a client-side utility that converts a `kajweb/dict` wordbook archive into an Anki import file.

## Language

**Wordbook archive**:
A ZIP file containing a JSON or newline-delimited JSON word list in the `kajweb/dict` data shape.
_Avoid_: Study session, learning plan

**Word entry**:
A normalized record containing the word, rank, phonetic transcription, meaning, example sentence, translation, and source book identifier.
_Avoid_: Review state, learned word

**Wordbook view**:
The complete imported wordbook displayed in client-side pages of 50 entries. Pagination changes only what is visible and never limits export scope.
_Avoid_: Daily words, released vocabulary

**Anki export**:
A tab-separated file containing every normalized word entry in the current wordbook, ready for Anki to import.
_Avoid_: Backup, progress export

**Local processing**:
ZIP parsing, normalization, pagination, and export all happen in the browser. Imported wordbooks are persisted in IndexedDB and addressed by a local `/vocab/:id` route; no learning state is stored and nothing is uploaded.
_Avoid_: Account storage, cloud sync
