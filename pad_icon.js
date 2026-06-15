const Jimp = require('jimp');

async function padIcon() {
  const image = await Jimp.read('./assets/images/app_logo.png');
  const size = Math.max(image.bitmap.width, image.bitmap.height);
  
  new Jimp(size, size, '#FFFFFF', (err, newImage) => {
    if (err) throw err;
    const x = (size - image.bitmap.width) / 2;
    const y = (size - image.bitmap.height) / 2;
    
    newImage.composite(image, x, y);
    newImage.write('./assets/images/app_icon.png', () => {
      console.log('Successfully wrote proper PNG to app_icon.png');
    });
  });
}

padIcon();
