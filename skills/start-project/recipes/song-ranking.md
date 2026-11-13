# Recipe: song ranking (친구들이 매기는 내 노래 랭킹)

The owner made ~20 songs and wants friends to rank them, to decide which song to release or promote first.

## Pre-filled interview

- Type: D (public link, but only invited friends really use it)
- Login: level 2 (Google) so one person = one vote set. Offer level 0 + nickname as the "가장 쉬운" option and explain the trade-off (anyone can vote many times).
- Data: shared (votes), results visible to the owner only
- Paid keys: none
- Mood: suggest `dark-studio` or `retro-pop`

## Audio files: links, not uploads

Firebase Storage may require the paid Blaze plan for new projects, so default to links:

- YouTube "일부 공개(unlisted)" video links → embed with the YouTube iframe
- SoundCloud private share links → SoundCloud embed player

Explain why in one sentence (free, no card). If the user insists on uploading MP3s, small files can live in `public/audio/` and be deployed with Hosting, but warn: Hosting has a free daily transfer limit, and anyone with the link can download the files.

## Data model (Firestore)

```
playlists/{playlistId}
  ownerUid, title, createdAt
  songs: [{ id, title, url, order }]
playlists/{playlistId}/votes/{voterUid}
  voterName, scores: { [songId]: number }   // star mode
  matches: [{ winner, loser }]              // worldcup mode
  updatedAt
```

## Two ranking modes

1. **별점 모드** — each song 1-5 stars. Rank by average, tie-break by number of votes.
2. **월드컵 모드 (이상형 월드컵)** — two songs at a time, pick one. Rank by Elo score (start 1000, K=32) computed from all matches. More fun for friends.

## Logic (pure functions in `src/logic/`, each with tests)

- `averageScores(votes) → [{ songId, average, count }]`
- `eloRatings(matches, songIds) → { [songId]: rating }`
- `makeBracket(songIds, seed) → pairs` (deterministic with a seed so tests are stable)
- `rankSongs(...) → ordered list`

Tests to include: empty votes, single vote, ties, Elo winner goes up and loser goes down by the same amount.

## Hooks (`src/hooks/`)

- `usePlaylist(playlistId)` — load songs
- `useMyVote(playlistId)` — load/save the current user's vote
- `useResults(playlistId)` — owner only; loads all votes and calls the logic functions

## Screens

1. Owner: create playlist, paste song titles + links, get a share link
2. Friend: open link → login (if level 2) → vote (stars or worldcup) → thank-you screen
3. Owner: results page with ranking, bar chart, number of voters

## Security rules (must be enforced in `firestore.rules`, not only hidden in the UI)

- Anyone signed in can read the playlist's songs
- Only the owner can create/edit the playlist
- A voter can create/update only their own vote doc (`voterUid == request.auth.uid`)
- Only the owner can read all votes

Show the user the "숨기기 vs 막기" difference: hiding the results button is not security; the rule is.
