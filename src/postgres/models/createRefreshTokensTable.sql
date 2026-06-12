DROP TABLE IF EXISTS refresh_tokens;

CREATE TABLE refresh_tokens (
    user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)