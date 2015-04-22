# notes
A temporary notes repo until I get my notes program finished

All notes in this repo are encrypted.

### dependencies
- node
- npm

### setup
- create a notes directory
- add notes
- when you want to encrypt your notes, run:
  - `$ node index.js -e`
  - this will encrypt all notes and throw them into an encrypted directory
- push repo to prefered git server
  - `$ git -am 'MESSAGE_HERE' && git push`
- if you want to sync your notes on a separate machine and need to decrypt, run:
  - `$ node index.js -d`
