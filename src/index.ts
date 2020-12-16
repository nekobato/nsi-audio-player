import { LitElement, property } from "lit-element";
import { html, svg, TemplateResult } from "lit-html";
import clsx from 'clsx';
import style from "./style.pcss";

const playIconPath = svg`<path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/>`;
const pauseIconPath = svg`<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/><path d="M0 0h24v24H0z" fill="none"/>`;
const repeatIconPath = svg`<path d="M0 0h24v24H0z" fill="none"/><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>`;
const volumeDownIconPath = svg`<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/><path d="M0 0h24v24H0z" fill="none"/>`;
const volumeUpIconPath = svg`<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/><path d="M0 0h24v24H0z" fill="none"/>`;
const moreIcon = svg`<path d="M0 0h24v24H0z" fill="none"/><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>`;

const svgIcon = (path: TemplateResult, className: string) => {
  return svg`
    <svg class=${className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${path}</svg>
  `;
};

const numberToTime = (number?: number) => {
  if (!number) return "0:00";
  return `${Math.floor(number / 60)}:${('0' + Math.floor(number % 60)).slice(-2)}`;
}

export class NsiAudioPlayer extends LitElement {
  @property ({ type: String }) title: string = "";
  @property ({ type: Boolean }) isPlaying: boolean = false;
  @property ({ type: Boolean }) isReady: boolean = false;
  @property ({ type: Boolean }) autoplay: boolean = false;
  @property ({ type: String }) src?: string;
  @property ({ type: Number }) currentTime?: number = 0;
  @property ({ type: Boolean }) controlDisplay?: boolean = false;
  @property ({ type: Boolean }) repeat?: boolean = false;

  constructor() {
    super();
  }

  get audio() {
    return this.shadowRoot?.querySelector('audio') as HTMLAudioElement;
  }

  get volumeInput() {
    return this.shadowRoot?.querySelector('#volume') as HTMLInputElement;
  }

  @property ({ type: Number })
  get volume(): number {
    return this.querySelector('audio')?.volume || 0;
  }
  set volume(value: number) {
    this.audio.volume = value;
  }

  get duration() {
    return this.audio?.duration;
  }

  get progressPercentage() {
    return (this.currentTime || 0) / this.duration * 100;
  }

  toggleRepeat() {
    this.repeat = !this.repeat;
  }

  protected onAudioReady() {
    this.isReady = true;
  };
  protected onAudioPlay() {
    this.isPlaying = true;
  };
  protected onAudioPause() {
    this.isPlaying = false;
  };
  protected onAudioEnded() {
    this.isPlaying = false;
  };
  protected onAudioTimeUpdate() {
    this.currentTime = this.audio.currentTime;
  };
  protected toggleControlDisplay() {
    this.controlDisplay = !this.controlDisplay;
  }
  protected onAudioVolumeChange() {
    this.volume = Number(this.volumeInput.value);
  }
  protected onAudioWaiting = null;
  protected onAudioLoadedMeta = (e: any) => {
    console.log(this);
  }
  protected playPause() {
    this.isPlaying ? this.pause() : this.play();
  }

  protected onClickProgressBar(e: MouseEvent) {
    const bar = this.shadowRoot?.querySelector('#progress_bar');
    const percentage = e.offsetX / (bar as HTMLDivElement).offsetWidth;
    this.currentTime = this.duration * percentage;
    this.audio.currentTime = this.duration * percentage;
  }

  render() {
    return html`
      <style>${style}</style>
      <div class="nsi-audio-player round">
        <audio
          id="audio"
          .src=${this.src || ""}
          ?autoplay=${this.autoplay}
          @loadeddata=${this.onAudioReady}
          @play=${this.onAudioPlay}
          @pause=${this.onAudioPause}
          @ended=${this.onAudioEnded}
          @timeupdate=${this.onAudioTimeUpdate}
          @volumechange=${this.onAudioVolumeChange}
          @waiting=${this.onAudioWaiting}
          @loadedmetadata=${this.onAudioLoadedMeta}
        ></audio>
        <div class="button pp-button" @click=${this.playPause}>
          ${svgIcon(this.isPlaying ? pauseIconPath : playIconPath, "play-pause-icon")}
        </div>
        <div id="progress_bar" class="progress-bar" @click=${this.onClickProgressBar} }>
          <div class="progress-inner" style="width: ${this.progressPercentage}%"></div>
          <div class="progress-scrubber"></div>
        </div>
        <div class="audio-info">
          <span class="audio-title">${this.title || ""}</span>
        </div>
        <span class="remaining-time">${numberToTime(this.duration - (this.currentTime || 0))}</span>
        <div class="controls-container">
          <div class=${clsx("controls", { open: this.controlDisplay || false })}>
            <div class="volume-display">
              <div class="volume-button down" tabindex="0">
                ${svgIcon(volumeDownIconPath, "volume-icon")}
              </div>
              <input id="volume" class="volume-slider" type="range" min="0" max="1" step="0.01" value=${this.volume} @change=${this.onAudioVolumeChange} />
              <div class="volume-button up" tabindex="0">
                ${svgIcon(volumeUpIconPath, "volume-icon")}
              </div>
            </div>
            <div class=${clsx("button", "repeat-button", { on: this.repeat })} @click=${this.toggleRepeat} tabindex="0">
              ${svgIcon(repeatIconPath, "repeat-icon")}
            </div>
          </div>
          <div class="button more-button" @click=${this.toggleControlDisplay} tabindex="0">
            ${svgIcon(moreIcon, "more-icon")}
          </div>
        </div>
      </div>
    `;
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }
}

window.customElements.define("nsi-audio-player", NsiAudioPlayer);
