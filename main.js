class TextBox extends Phaser.GameObjects.Graphics {
  constructor(scene, options) {
    super(scene, options);
    const { width, height } = this.scene.sys.game.config;
    this.boxConfig = {
      width: width - 40,
      height: 80,
      x: 20,
      y: height - 100,
      fill: 0x000000,
      alpha: 0.8,
      radius: 10,
    };
    this.createModal();
  }

  createModal() {
    this.box = this.scene.add.graphics({
      fillStyle: { color: this.boxConfig.fill, alpha: this.boxConfig.alpha },
    });
    this.box.fillRoundedRect(
      this.boxConfig.x,
      this.boxConfig.y,
      this.boxConfig.width,
      this.boxConfig.height,
      this.boxConfig.radius
    );
    this.box.setDepth(900);
    this.modalText = this.scene.add.text(
      this.boxConfig.x + 20,
      this.boxConfig.y + 10,
      "",
      {
        font: "20px PixelFont",
        fill: "#ffffff",
        wordWrap: { width: this.boxConfig.width - 40 },
      }
    );
    this.modalText.setDepth(1000);
  }

  show(content) {
    this.box.setVisible(true);
    this.modalText.setVisible(true);
    this.modalText.setText("");
    const textSound = this.scene.sound.add("text_sound", { loop: true });
    textSound.play();

    const words = content.split(" ");
    let currentWordIndex = 0;
    this.scene.time.addEvent({
      delay: 200,
      repeat: words.length - 1,
      callback: () => {
        this.modalText.text += words[currentWordIndex] + " ";
        currentWordIndex++;
        if (currentWordIndex === words.length) {
          textSound.stop();
        }
    },
  });

  return 200 * words.length;
}


  hide() {
    this.box.setVisible(false);
    if (this.modalText) this.modalText.setVisible(false);
  }
}

class WeatherPrediction extends Phaser.Scene {
  preload() {
    this.load.image(
      "background",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/finalbackground.png?v=1742523310214"
    );
    this.load.image(
      "witch",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/witch.png?v=1742523389149"
    );
    this.load.image(
      "sunny",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/Sunny.png?v=1742527253396"
    );
    this.load.image(
      "cloudy",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/Cloudy.png?v=1742527040009"
    );
    this.load.image(
      "rain",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/Rain.png?v=1742527148204"
    );
    this.load.image(
      "storm",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/Storm.png?v=1742527211989"
    );
    this.load.audio(
      "background_sound",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/creepy-music.mp3?v=1742488562260"
    );
    this.load.audio(
      "text_sound",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/text_sound.wav?v=1742489028778"
    );
    this.load.spritesheet(
      "idle",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/spritesheet.png?v=1742524848352",
      { frameWidth: 500, frameHeight: 500 }
    );
    this.load.spritesheet(
      "predict",
      "https://cdn.glitch.global/754eeaf3-5920-44b7-b5dd-cee3be7d8fb4/predict_spritesheet.png?v=1742527393028",
      { frameWidth: 500, frameHeight: 500 }
    );
  }

  create() {
    const backgroundSound = this.sound.add("background_sound", { loop: true });
    backgroundSound.setVolume(0.2);
    backgroundSound.play();
    this.background = this.add.image(0, 0, "background").setOrigin(0, 0);
    this.background.setInteractive();

    this.anims.create({
      key: "idle",
      frames: [
        { key: "idle", frame: 0 },
        { key: "idle", frame: 2 },
      ],
      duration: 4,
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: "predict",
      frames: [
        { key: "predict", frame: 0 },
        { key: "predict", frame: 2 },
        { key: "predict", frame: 4 },
        { key: "predict", frame: 1 },
        { key: "predict", frame: 3 },
      ],
      duration: 4,
      frameRate: 8,
      repeat: -1,
    });


    this.player = this.add.sprite(250, 250, "idle");
    this.player.anims.play("idle");

    this.modal = new TextBox(this);
    this.sound.unlock();
    this.modal.show("Do you wish to see the future? (Enter or tap)");


    this._INPUTS = this.input.keyboard.createCursorKeys();
    this._INPUTS.enter = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this._INPUTS.enter.on("down", () => {
      this.showWeather();
    });

  
    this.background.on("pointerdown", () => {
      this.showWeather();
    });
  }

  showWeather() {
 
    this.player.setVisible(false);
    const predictSprite = this.add.sprite(250, 250, "predict");
    predictSprite.anims.play("predict");


    const textAnimationTime = this.modal.show(
      "I see...... the spirits are showing me an image..........."
    );


    this.time.delayedCall(textAnimationTime, async () => {
      const forecast = await fetchWeatherForecast();
      predictSprite.setVisible(false);
      const weatherImageKey = getWeatherImageKey(forecast);
      this.add.image(0, 0, weatherImageKey).setOrigin(0, 0);
      this.modal.show(`Tomorrow's weather will be ${forecast}`);
    });
  }
}


async function fetchWeatherForecast() {
  const location = await getUserLocation();
  const query = location ? `${location.lat},${location.lon}` : "Pittsburgh";
  const apiKey = "f1ec4107d6114c069f100136251903"
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=2&aqi=no&alerts=yes`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (
      data.forecast &&
      data.forecast.forecastday &&
      data.forecast.forecastday[1]
    ) {
      return data.forecast.forecastday[1].day.condition.text;
    } else {
      return "Unavailable";
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    return "Unavailable";
  }
}

function getUserLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        }
      );
    } else {
      resolve(null);
    }
  });
}

function getWeatherImageKey(conditionText) {
  const text = conditionText.toLowerCase();
  if (text.includes("sunny") || text.includes("clear")) return "sunny";
  else if (text.includes("cloudy") || text.includes("overcast"))
    return "cloudy";
  else if (text.includes("rain") || text.includes("drizzle")) return "rain";
  else if (text.includes("storm") || text.includes("thunder")) return "storm";
  return "sunny";
}

const config = {
  type: Phaser.AUTO,
  width: 500,
  height: 500,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: WeatherPrediction,
  pixelArt: true,
  roundPixels: true,
};

new Phaser.Game(config);
