# MTG Processor App

[![Build Status](https://travis-ci.org/dills122/mtg-processor.svg?branch=master)](https://travis-ci.org/dills122/mtg-processor)

This repo is the future home of the full featured MTG card analyzer, cataloger, and financial tracker.

This project started initially [Here](https://github.com/dills122/MTG-Card-Analyzer)

Stay Tuned.

## Up and Running

Clone the repo

```bash
git clone https://github.com/dills122/mtg-processor.git
```

Bootstrap all the repos

```bash
lerna bootstrap
```

### Core-SDK

Starting development

```bash
# Will start watching for changes (typescript)
npm run watch

# Compile all the files
npm run compile
```

**This needs to run before PRs**

```bash
# Will remove all generated files
npm run clean
```

Follow the instructions within `core-sdk` for more information on a complete setup
