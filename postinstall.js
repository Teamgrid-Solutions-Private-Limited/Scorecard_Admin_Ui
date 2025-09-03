import fs from 'fs-extra';
import path from 'path';

try {
  const source = path.resolve('node_modules', 'tinymce');
  const destination = path.resolve('public', 'tinymce');

  if (fs.existsSync(source)) {
    fs.copySync(source, destination, { overwrite: true });
    //console.log('TinyMCE files copied successfully');
  } else {
    //console.log('TinyMCE source directory not found. Skipping copy operation.');
  }
} catch (err) {
  //console.error('Error during postinstall script:', err);
}