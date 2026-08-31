const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pastaDestino = path.join(__dirname, '..', '..', 'frontend', 'assets', 'imagens');
if (!fs.existsSync(pastaDestino)) {
  fs.mkdirSync(pastaDestino, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pastaDestino),
  filename: (req, file, cb) => {
    const nomeUnico = `produto-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, nomeUnico);
  }
});

function filtroArquivo(req, file, cb) {
  const tiposPermitidos = /jpeg|jpg|png|webp/;
  const extensaoOk = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = tiposPermitidos.test(file.mimetype);
  if (extensaoOk && mimeOk) return cb(null, true);
  cb(new Error('Apenas imagens JPG, PNG ou WEBP são permitidas.'));
}

const upload = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
