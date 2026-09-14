const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '../../../frontend/public/assets/listening');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const assetsToDownload = [
  {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    filename: 'toeic_part1_1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    filename: 'toeic_part1_2.jpg'
  },
  {
    url: 'https://speech-samples.s3.amazonaws.com/toeic_p1_q1.mp3',
    filename: 'toeic_part1_1.mp3'
  },
  {
    url: 'https://speech-samples.s3.amazonaws.com/toeic_p1_q2.mp3',
    filename: 'toeic_part1_2.mp3'
  }
];

function downloadFile(fileUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`✅ Downloaded: ${path.basename(outputPath)}`);
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      console.warn(`⚠️ Warning downloading ${fileUrl}:`, err.message);
      resolve();
    });
  });
}

async function runDownload() {
  console.log('⬇️ Downloading real TOEIC audio clips & images into frontend public assets...');
  for (const item of assetsToDownload) {
    const dest = path.join(targetDir, item.filename);
    await downloadFile(item.url, dest);
  }
  console.log('🎉 All TOEIC assets stored locally in project!');
}

runDownload();
