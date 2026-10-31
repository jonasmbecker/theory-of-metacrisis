# How to suggest a change

Thank you for thinking this through with us. You do not need to know code. You need a clear idea and a reason for it.

Soon you will be able to suggest a change straight from the map in the editor, with no account. Until then, suggestions come in through GitHub, which needs a free account; the last section below explains how.

## What you can suggest

- Add, rename or remove a card
- Improve a card's description
- Add or remove an arrow between two cards, or change what it says
- Add a source that supports or challenges an arrow

Moving cards around is welcome too, but it is never a reason to accept or decline a suggestion.

## Writing a card description

Descriptions are read by people who have never met this theory. Write for them.

1. **Make it stand alone.** Explain the idea in two or three plain sentences, without jargon or with the jargon explained.
2. **Do not talk about the map.** Never write "this leads to the cards on the right", "see the arrow from..." or "linked to the first three drivers". The arrows already show that. Do not leave notes to yourself or to the maintainer in a description.
3. **Credit the thinker.** When an idea comes from a person or a model, end the description with their name in brackets, for example *(Schmachtenberger)*, *(Brown)*, *(Heller, NARM)*, *(Maté)* or *(Hagens)*.
4. **At most one link per card**, to a well-known, trusted page about the idea (an encyclopedia entry, the thinker's own organisation, a respected institute). Open it before you add it. Never add a link you have not read.
5. **Do not label text as written by AI.** Whoever proposes a text stands behind it as their own words, and the page is judged on what it says, not on how it was written.

## Giving a reason and evidence

Every suggestion needs a reason in your own words. For a change to an arrow or a claim, say who or what supports it:

- Best: research, a book or an interview where the claim is made, with a link or a page number.
- Good: your professional experience, described honestly as experience ("in my practice as a therapist, I see...").
- Not enough: "it seems obvious" or "everyone knows".

If you are less than certain, say so. An arrow can carry a confidence from 0 to 100, and an honest 40 is more useful than a confident 90.

## What happens next

An automatic check makes sure the files are well formed (no broken links to cards, web addresses start with http or https, every card has a position). A person then reads your suggestion and either accepts it into the map, asks you a question, or declines it with a reason. Declined does not mean wrong: it can mean the evidence is not yet there, or the card is not the right place.

Please be patient. This is one person's volunteer time for now.

## Who decides

Jonas Becker (@jonasmbecker) is the only maintainer at launch and makes the final call on every suggestion. More maintainers will be named here as people join; until then, nothing is accepted without his review.

## Using GitHub directly

Edit `map/content.json` for changes to the theory and open a pull request (GitHub's name for a suggested change). Leave `map/layout.json` alone unless you are moving cards. If you can, run `node scripts/validate-map.mjs` before you submit; the same check also runs by itself on every pull request. Do not change file names or the order of fields.

## Being kind

Disagree with ideas, not with people. Suggestions that are abusive, spam, or written to mislead will be closed.
