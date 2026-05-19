import fs from "fs";
import path from "path";

/**
 * Reads a markdown legal document from src/content/legal/{name}.md
 * Must only be called from Server Components or Server Actions.
 * @param {string} name - filename without extension (e.g. "terms", "privacy")
 * @returns {string} markdown content
 */
export function getLegalDoc(name) {
    const filePath = path.join(process.cwd(), "src/content/legal", `${name}.md`);

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Legal document "${name}.md" not found at ${filePath}. ` +
            `Make sure the file exists in src/content/legal/`
        );
    }

    return fs.readFileSync(filePath, "utf-8");
}