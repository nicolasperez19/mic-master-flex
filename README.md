<div align="center">
    <h1>
    🎙️MicMasterFlex
    </h1>
    <p align="left">
      <b>MicMasterFlex</b> is a web app that allows users to configure the positions of a microphone array on an interactive grid. 
    </p>
    <p align="left">Designed for audio engineers and researchers, this tool offers an intuitive interface for precise microphone placement, enabling users to simulate and optimize array setups for various acoustic applications.</p>
    <a href="https://github.com/nicolasperez19/mic-master-flex/"><img src="https://img.shields.io/github/stars/nicolasperez19/mic-master-flex?style=for-the-badge&logo=github&logoColor=white" alt="Github Stars"></a>
    <a href="https://buymeacoffee.com/nico_perez"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%23FFDD00.svg?&style=for-the-badge&logo=buy-me-a-coffee&logoColor=black"></a>
</div>

# Table of Contents

1. [Demo](#demo)
2. [Project motivation](#project-motivation)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the project locally](#running-the-project-locally)
6. [Building the project locally](#building-the-project-locally)
7. [Project structure](#project-structure)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Lighthouse Audit](#lighthouse-audit)
10. [Citation](#citation)

## 📸 Demo
https://github.com/user-attachments/assets/419bda8b-d6a5-4f54-87b8-acef9d752226

## 💡 Project Motivation
**MicMasterFlex** was born out of challenges encountered during the [*Robots as Furniture*](https://github.com/robotsasfurniture/passive-sound-localization) project at [Brown University Human-centered Robotics Initiative](https://hcri.brown.edu/), where configuring a microphone array for sound localization required precise positioning of multiple microphones. 

Given the complex arrangement, writing down positions manually without a visual guide proved inefficient and error-prone. 

MicMasterFlex addresses this by offering an interactive, visual interface to configure microphone positions on a grid, making it easier to plan and visualize the array layout. 

Additionally, the tool generates the necessary `numpy` code for these positions, streamlining the setup process for audio processing and sound localization tasks.

## 📋 Prerequisites
In order to run the project locally, you must have [Bun runtime](https://bun.sh/) installed.

## 💾 Installation
To install the project locally, clone the git repository and install all dependencies by running the following commands in your terminal:
```sh
git clone https://github.com/nicolasperez19/mic-master-flex.git
cd mic-master-flex
bun install
```

## 🏃‍♂️💨 Running the Project Locally
To run the project locally in developer mode, run the following command in your terminal:
```sh
bun run dev
```

## 🏗️ Building the Project Locally
To build the project locall, run the following command in your terminal:
```sh
bun run build
```

The production version of the site will be available in the `./dist` folder.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.


## ⌨️ Keyboard Shortcuts

MicMasterFlex now supports keyboard shortcuts for changing modes:

- Press '1' for Pan mode
- Press '2' for Add mode
- Press '3' for Edit mode
- Press '4' for Delete mode
=======
## 🌟 Lighthouse Audit

We have integrated Lighthouse CI into our continuous integration process to ensure the highest quality of our web application. Lighthouse CI runs audits for performance, accessibility, best practices, SEO, and more.

### Running Lighthouse CI Locally

To run Lighthouse CI locally, use the following command:

```sh
npm run lighthouse
```

This will execute the Lighthouse CI audit and provide a detailed report of the results.


## 📝 Citation

If you'd like to cite this project, please use this BibTex:

```
@article{perez2024micmasterflex,
  title={MicMasterFlex},
  author={Nicolas Perez},
  journal={https://example.com/},
  year={2024}
}
```
