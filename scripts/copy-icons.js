// Copie les icônes .svg de nodes/ vers dist/nodes/ après compilation TypeScript
// (tsc ne copie que les .ts, pas les assets statiques).
const fs = require('fs');
const path = require('path');

function copySvgs(srcDir, destDir) {
	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		const srcPath = path.join(srcDir, entry.name);
		const destPath = path.join(destDir, entry.name);
		if (entry.isDirectory()) {
			fs.mkdirSync(destPath, { recursive: true });
			copySvgs(srcPath, destPath);
		} else if (entry.name.endsWith('.svg')) {
			fs.mkdirSync(destDir, { recursive: true });
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

copySvgs(path.join(__dirname, '..', 'nodes'), path.join(__dirname, '..', 'dist', 'nodes'));
