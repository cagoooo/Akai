// 音效管理器
// 使用 import.meta.env.BASE_URL 支援不同部署環境

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement>;
  private isMuted: boolean = false;
  private baseUrl: string;

  private constructor() {
    this.sounds = new Map();
    // 獲取 base URL (Firebase: '/', GitHub Pages: '/Akai/')
    this.baseUrl = import.meta.env.BASE_URL || '/';
    this.initializeSounds();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeSounds() {
    // 排名上升音效
    const rankUpSound = new Audio(`${this.baseUrl}sounds/rank-up.mp3`);
    rankUpSound.volume = 0.3;
    this.sounds.set('rankUp', rankUpSound);

    // 排名下降音效
    const rankDownSound = new Audio(`${this.baseUrl}sounds/rank-down.mp3`);
    rankDownSound.volume = 0.3;
    this.sounds.set('rankDown', rankDownSound);

    // 點擊音效
    const clickSound = new Audio(`${this.baseUrl}sounds/click.mp3`);
    clickSound.volume = 0.2;
    this.sounds.set('click', clickSound);

    // 成就解鎖音效
    const achievementSound = new Audio(`${this.baseUrl}sounds/achievement.mp3`);
    achievementSound.volume = 0.4;
    this.sounds.set('achievement', achievementSound);
  }

  public playSound(soundName: string) {
    if (this.isMuted) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      // 重置音效以便重複播放
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.warn(`Failed to play sound: ${soundName}`, error);
      });
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = SoundManager.getInstance();
