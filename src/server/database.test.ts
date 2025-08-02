import sqlite3 from 'sqlite3';
import fs from 'fs';

// Test Database class without unique username constraint
class TestDatabase {
  private db: sqlite3.Database;

  constructor(dbPath: string = './test-game.db') {
    this.db = new sqlite3.Database(dbPath);
  }

  async initialize() {
    const createUserSessionsTable = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise<void>((resolve, reject) => {
      this.db.run(createUserSessionsTable, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async createSession(username: string): Promise<{id: string, username: string, createdAt: string, lastActive: string, status: 'active' | 'inactive'}> {
    const sessionId = this.generateSessionId();
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO user_sessions (id, username, status) VALUES (?, ?, "active")',
        [sessionId, username],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: sessionId,
              username,
              createdAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              status: 'active'
            });
          }
        }
      );
    });
  }

  async getSession(sessionId: string): Promise<{id: string, username: string, createdAt: string, lastActive: string, status: 'active' | 'inactive'} | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, username, status, created_at, last_active FROM user_sessions WHERE id = ? AND status = "active"',
        [sessionId],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              id: row.id,
              username: row.username,
              createdAt: row.created_at,
              lastActive: row.last_active,
              status: row.status
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getAllUsers(): Promise<{id: string, username: string, createdAt: string, lastActive: string, status: 'active' | 'inactive'}[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, username, status, created_at, last_active FROM user_sessions ORDER BY created_at DESC',
        [],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const users = rows.map(row => ({
              id: row.id,
              username: row.username,
              createdAt: row.created_at,
              lastActive: row.last_active,
              status: row.status
            }));
            resolve(users);
          }
        }
      );
    });
  }

  async updateLastActive(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE user_sessions SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [sessionId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deactivateSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE user_sessions SET status = "inactive" WHERE id = ?',
        [sessionId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM user_sessions WHERE id = ?',
        [sessionId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async findExistingUser(username: string): Promise<{id: string, username: string, createdAt: string, lastActive: string, status: 'active' | 'inactive'} | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, username, status, created_at, last_active FROM user_sessions WHERE username = ? AND status = "active" ORDER BY last_active DESC LIMIT 1',
        [username],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              id: row.id,
              username: row.username,
              createdAt: row.created_at,
              lastActive: row.last_active,
              status: row.status
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  close() {
    this.db.close();
  }
}

describe('Database Username Login Tests', () => {
  let testDb: TestDatabase;
  const testDbPath = './test-game.db';

  beforeEach(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Create a new test database for each test
    testDb = new TestDatabase(testDbPath);
    await testDb.initialize();
  });

  afterEach(() => {
    // Close the database connection and clean up
    testDb.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('should create session with unique username', async () => {
    // Create a session with a unique username
    const session = await testDb.createSession('testuser');

    // Verify session was created successfully
    expect(session.id).toBeDefined();
    expect(session.username).toBe('testuser');
    expect(session.createdAt).toBeDefined();
    expect(session.lastActive).toBeDefined();

    // Verify session can be retrieved
    const retrievedSession = await testDb.getSession(session.id);
    expect(retrievedSession).not.toBeNull();
    expect(retrievedSession!.username).toBe('testuser');
  });

  test('should allow multiple sessions with same username', async () => {
    // Create first session
    const session1 = await testDb.createSession('duplicateuser');

    // Create second session with same username should succeed
    const session2 = await testDb.createSession('duplicateuser');
    
    expect(session1.username).toBe('duplicateuser');
    expect(session2.username).toBe('duplicateuser');
    expect(session1.id).not.toBe(session2.id);
  });

  test('should find existing user correctly', async () => {
    // Check no user exists initially
    const noUser = await testDb.findExistingUser('existinguser');
    expect(noUser).toBeNull();

    // Create a session
    const session = await testDb.createSession('existinguser');

    // Should find the existing user
    const foundUser = await testDb.findExistingUser('existinguser');
    expect(foundUser).not.toBeNull();
    expect(foundUser!.username).toBe('existinguser');
    expect(foundUser!.id).toBe(session.id);

    // Should not find different username
    const notFound = await testDb.findExistingUser('differentuser');
    expect(notFound).toBeNull();
  });

  test('should allow creating new session after session deletion', async () => {
    // Create a session
    const session = await testDb.createSession('reuseuser');
    
    // Verify user exists
    const userBefore = await testDb.findExistingUser('reuseuser');
    expect(userBefore).not.toBeNull();

    // Delete the session
    await testDb.deleteSession(session.id);

    // Verify user no longer exists
    const userAfter = await testDb.findExistingUser('reuseuser');
    expect(userAfter).toBeNull();

    // Should be able to create new session with same username
    const newSession = await testDb.createSession('reuseuser');
    expect(newSession.username).toBe('reuseuser');
    expect(newSession.id).not.toBe(session.id); // Different session ID
  });

  test('should return all users including duplicates', async () => {
    // Create sessions with some duplicate usernames
    await testDb.createSession('alice');
    await testDb.createSession('bob');
    await testDb.createSession('alice');

    const allUsers = await testDb.getAllUsers();

    // Should have 3 total sessions
    expect(allUsers).toHaveLength(3);

    // Verify usernames can be duplicated
    const usernames = allUsers.map(user => user.username);
    expect(usernames).toContain('alice');
    expect(usernames).toContain('bob');
    expect(usernames.filter(name => name === 'alice')).toHaveLength(2);
    expect(usernames.filter(name => name === 'bob')).toHaveLength(1);
  });

  test('should maintain session data correctly', async () => {
    // Create a session
    const session = await testDb.createSession('sessionuser');

    // Update last active
    await testDb.updateLastActive(session.id);

    // Retrieve session
    const retrievedSession = await testDb.getSession(session.id);
    expect(retrievedSession).not.toBeNull();
    expect(retrievedSession!.username).toBe('sessionuser');
    expect(retrievedSession!.id).toBe(session.id);
    expect(retrievedSession!.status).toBe('active');
  });

  test('should deactivate session instead of deleting on logout', async () => {
    // Create two sessions
    const session1 = await testDb.createSession('user1');
    const session2 = await testDb.createSession('user2');

    // Deactivate first session (logout)
    await testDb.deactivateSession(session1.id);

    // Verify first session is no longer retrievable via getSession (active sessions only)
    const retrievedSession1 = await testDb.getSession(session1.id);
    expect(retrievedSession1).toBeNull();

    // Verify second session is still active
    const retrievedSession2 = await testDb.getSession(session2.id);
    expect(retrievedSession2).not.toBeNull();
    expect(retrievedSession2!.status).toBe('active');

    // Verify both sessions appear in getAllUsers (includes inactive)
    const allUsers = await testDb.getAllUsers();
    expect(allUsers).toHaveLength(2);
    
    const inactiveUser = allUsers.find(u => u.id === session1.id);
    const activeUser = allUsers.find(u => u.id === session2.id);
    
    expect(inactiveUser).toBeDefined();
    expect(inactiveUser!.status).toBe('inactive');
    expect(activeUser).toBeDefined();
    expect(activeUser!.status).toBe('active');

    // Verify deactivated user is no longer found by findExistingUser
    const foundUser = await testDb.findExistingUser('user1');
    expect(foundUser).toBeNull();
  });
});