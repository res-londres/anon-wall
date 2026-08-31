DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS alt_names CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;

CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    socket_id TEXT,
    username TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alt_names (
    alt_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    alt_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, alt_name)
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    attribution TEXT NOT NULL,
    subject TEXT DEFAULT '[NO SUBJECT]',
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(post_id),
    user_id TEXT NOT NULL REFERENCES users(user_id),
    attribution TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE post_likes (
    user_id TEXT REFERENCES users(user_id),
    post_id INTEGER REFERENCES posts(post_id),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE comment_likes (
    user_id TEXT REFERENCES users(user_id),
    comment_id INTEGER REFERENCES comments(comment_id),
    PRIMARY KEY (user_id, comment_id)
);

 CREATE INDEX IF NOT EXISTS idx_users_socket_id ON users(socket_id)
 CREATE INDEX IF NOT EXISTS idx_alt_names_user_id ON alt_names(user_id)
 CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)
 CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)
    