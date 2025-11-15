import assert from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { generateCommitBody } from "./commitBody.js";

describe("commitBody", () => {
  let tempDir: string;
  let gitRepoDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    // 環境変数のバックアップ
    originalEnv = { ...process.env };
    
    // テスト用の環境変数を設定
    process.env.GIT_AUTHOR_NAME = "Test Author";
    process.env.GIT_AUTHOR_EMAIL = "author@test.com";
    process.env.GIT_COMMITTER_NAME = "Test Committer";
    process.env.GIT_COMMITTER_EMAIL = "committer@test.com";
    
    // 一時ディレクトリの作成
    tempDir = await mkdtemp(join(tmpdir(), "mygit-commit-test-"));
    gitRepoDir = join(tempDir, "git-repo");
    await mkdir(gitRepoDir, { recursive: true });
    await mkdir(join(gitRepoDir, ".git"), { recursive: true });
    await mkdir(join(gitRepoDir, ".git", "refs", "heads"), { recursive: true });
  });

  afterEach(async () => {
    // 環境変数の復元
    process.env = originalEnv;
    
    // 一時ディレクトリの削除
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("generateCommitBody", () => {
    it("should generate commit body for first commit (no parent)", async () => {
      const message = "Initial commit";
      const headContent = "ref: refs/heads/main";
      await writeFile(join(gitRepoDir, ".git", "HEAD"), headContent);
      
      const result = await generateCommitBody(message, gitRepoDir);
      
      // 基本的な構造をチェック
      assert.ok(result.includes("tree 0000000000000000000000000000000000000000"));
      assert.ok(result.includes("author Test Author <author@test.com>"));
      assert.ok(result.includes("committer Test Committer <committer@test.com>"));
      assert.ok(result.includes("Initial commit"));
      
      // parent行が含まれていないことを確認
      assert.ok(!result.includes("parent"));
    });

    it("should generate commit body with parent commit", async () => {
      const message = "Second commit";
      const headContent = "ref: refs/heads/main";
      const parentOid = "a1b2c3d4e5f6789abcdef0123456789abcdef01";
      
      await writeFile(join(gitRepoDir, ".git", "HEAD"), headContent);
      await writeFile(join(gitRepoDir, ".git", "refs", "heads", "main"), parentOid);
      
      const result = await generateCommitBody(message, gitRepoDir);
      
      // parent行が含まれていることを確認
      assert.ok(result.includes(`parent ${parentOid}`));
      assert.ok(result.includes("Second commit"));
    });

    it("should include timestamp in author and committer lines", async () => {
      const message = "Test commit";
      const headContent = "ref: refs/heads/main";
      await writeFile(join(gitRepoDir, ".git", "HEAD"), headContent);
      
      const result = await generateCommitBody(message, gitRepoDir);
      
      // タイムスタンプの形式をチェック（数字 + スペース + タイムゾーン）
      const timestampRegex = /\d+\s[+-]\d{4}/;
      assert.ok(timestampRegex.test(result), "Timestamp should be in correct format");
    });

    it("should handle multi-line commit message", async () => {
      const message = "First line\n\nSecond line\nThird line";
      const headContent = "ref: refs/heads/main";
      await writeFile(join(gitRepoDir, ".git", "HEAD"), headContent);
      
      const result = await generateCommitBody(message, gitRepoDir);
      
      assert.ok(result.includes("First line"));
      assert.ok(result.includes("Second line"));
      assert.ok(result.includes("Third line"));
    });
  });
});