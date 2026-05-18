import { describe, expect, it } from "vitest";

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const sourceRoots = ["src", "test"];
const sourceExtension = /\.(ts|tsx)$/;
const maxLines = 400;
const codexRoot = join(root, ".codex");
const rulesRoot = join(codexRoot, "rules");
const agentsRoot = join(codexRoot, "agents");
const skillsRoot = join(codexRoot, "skills");
const requiredRules = [
  "ai-safety.md",
  "architecture.md",
  "testing.md",
  "ui-ux.md",
  "white-label.md",
  "reusability.md",
];
const requiredAgents = [
  "architect.md",
  "tester.md",
  "designer.md",
  "reviewer-fixer.md",
];
const requiredSkills = [
  "add-feature-domain",
  "architect",
  "ai-change-workflow",
  "test-coverage-guardian",
  "create-api",
  "create-hook",
  "create-page",
  "create-ui-component",
  "ui-ux",
  "white-label-app",
  "review-changes",
  "debug-issue",
  "refactor-safely",
  "explore-codebase",
  "supabase",
  "supabase-postgres-best-practices",
];

function walkFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    return stats.isDirectory() ? walkFiles(path) : [path];
  });
}

function sourceFiles() {
  return sourceRoots
    .flatMap((directory) => walkFiles(join(root, directory)))
    .filter((file) => sourceExtension.test(file));
}

function read(file: string) {
  return readFileSync(file, "utf8");
}

function markdownFiles(directory: string) {
  return walkFiles(directory).filter((file) => file.endsWith(".md"));
}

function skillFiles() {
  return readdirSync(skillsRoot)
    .map((entry) => join(skillsRoot, entry, "SKILL.md"))
    .filter((file) => existsSync(file));
}

function parseFrontmatter(file: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(read(file));

  if (!match) {
    return null;
  }

  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line))
      .filter((line): line is RegExpExecArray => Boolean(line))
      .map((line) => [line[1], line[2].replace(/^["']|["']$/g, "")]),
  );
}

describe("architecture boundaries", () => {
  it("keeps TypeScript source and test files under 400 lines", () => {
    const oversized = sourceFiles()
      .map((file) => ({
        file: relative(root, file),
        lines: read(file).split(/\r?\n/).length,
      }))
      .filter(({ lines }) => lines > maxLines);

    expect(oversized).toEqual([]);
  });

  it("keeps domain files independent from React, Next, and Supabase", () => {
    const forbidden =
      /from\s+["'](?:react|next\/|@supabase\/|@\/platform\/supabase|@\/components\/ui)/;
    const violations = sourceFiles()
      .filter((file) => file.includes(`${sep}domain${sep}`))
      .filter((file) => forbidden.test(read(file)))
      .map((file) => relative(root, file));

    expect(violations).toEqual([]);
  });

  it("keeps generic UI primitives free from feature imports", () => {
    const violations = sourceFiles()
      .filter((file) => file.includes(`${sep}components${sep}ui${sep}`))
      .filter((file) => /@\/features\//.test(read(file)))
      .map((file) => relative(root, file));

    expect(violations).toEqual([]);
  });

  it("keeps Codex rules, agents, and skills in their dedicated folders", () => {
    const missingRules = requiredRules.filter(
      (file) => !existsSync(join(rulesRoot, file)),
    );
    const missingAgents = requiredAgents.filter(
      (file) => !existsSync(join(agentsRoot, file)),
    );
    const missingSkills = requiredSkills.filter(
      (directory) => !existsSync(join(skillsRoot, directory, "SKILL.md")),
    );
    const bannedFolders = [".agents", ".claude", ".cursor", ".kiro"].filter(
      (directory) => existsSync(join(root, directory)),
    );

    expect({
      missingRules,
      missingAgents,
      missingSkills,
      bannedFolders,
    }).toEqual({
      missingRules: [],
      missingAgents: [],
      missingSkills: [],
      bannedFolders: [],
    });
  });

  it("keeps project skills discoverable through valid frontmatter", () => {
    const invalidSkills = skillFiles()
      .map((file) => ({
        file: relative(root, file),
        frontmatter: parseFrontmatter(file),
      }))
      .filter(
        ({ frontmatter }) => !frontmatter?.name || !frontmatter.description,
      )
      .map(({ file }) => file);

    expect(invalidSkills).toEqual([]);
  });

  it("keeps canonical rule bodies out of skills and agents", () => {
    const ruleBodies = markdownFiles(rulesRoot).map((file) =>
      read(file).trim(),
    );
    const workflowFiles = [...skillFiles(), ...markdownFiles(agentsRoot)];
    const duplicatedRules = workflowFiles.flatMap((file) => {
      const content = read(file);

      return ruleBodies
        .filter((body) => body.length > 120 && content.includes(body))
        .map((body) => ({
          file: relative(root, file),
          rulePreview: body.slice(0, 40),
        }));
    });

    expect(duplicatedRules).toEqual([]);
  });
});
