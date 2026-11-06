# The theory of the metacrisis

An open, evolving map of how unmet childhood needs, the survival strategies they produce, and the systems built on those strategies lead to the metacrisis, seen as outcomes of one connected pattern rather than separate problems.

The map reads left to right: **unmet needs**, **survival strategies**, **metacrisis drivers**, **structures and incentives**, and **outcomes**, with a column of marginal notes. Each card is one idea, with a short description and, where one exists, a link to read more. Arrows between cards are claims that one thing feeds another; each carries a confidence, the reasoning behind it and its evidence.

It is a draft of a theory, not a finished one. Anyone may propose a change.

## View the map

Open it in the editor: **https://toceditor.netlify.app** (no account needed). You can look around, edit your own copy and share it by link.

## Suggest a change

Press **Suggest a change** in the editor: it needs no GitHub account and opens a pull request for you. If you use GitHub, you can also edit a theory's `content.json` under `theories/` and open a pull request. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first; it is short and written for non-technical readers.

## What is in this repository

| Path | What it holds |
| --- | --- |
| `theories/index.json` | Which theories exist, which one opens first, and whether each is its author's own or a reconstruction |
| `theories/<name>/content.json` | Everything about one theory: cards, descriptions, arrows, reasoning, evidence, groups |
| `theories/<name>/layout.json` | Only where cards sit on the screen, so moving a card never hides a change to the theory |
| `map/` | The old location of Jonas's theory, kept for one release so earlier links keep working; edit `theories/jonas/` instead |
| `scripts/validate-map.mjs` | The automatic check that runs on every proposal |
| `CONTRIBUTING.md` | How to write a good suggestion, and who decides |

Run the check yourself with `node scripts/validate-map.mjs` (Node 20 or newer, nothing to install).

## Who decides

Jonas Becker ([@jonasmbecker](https://github.com/jonasmbecker)) is the only maintainer for now. More maintainers will be named here when there are some.
