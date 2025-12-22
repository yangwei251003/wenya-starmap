-- 创建学习状态枚举
CREATE TYPE card_state AS ENUM ('new', 'learning', 'review', 'relearning');

-- 创建 study_logs 表
CREATE TABLE IF NOT EXISTS study_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    word_id VARCHAR(255) NOT NULL,
    
    -- FSRS 核心字段
    last_review TIMESTAMPTZ,
    next_review TIMESTAMPTZ NOT NULL,
    stability FLOAT NOT NULL DEFAULT 0,
    difficulty FLOAT NOT NULL DEFAULT 4.0,
    state card_state NOT NULL DEFAULT 'new',
    step INTEGER NOT NULL DEFAULT 0,
    
    -- 统计字段
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    elapsed_days FLOAT NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 约束
    UNIQUE(user_id, word_id)
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_study_logs_user_id ON study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_next_review ON study_logs(next_review);
CREATE INDEX IF NOT EXISTS idx_study_logs_state ON study_logs(state);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_next_review ON study_logs(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_state ON study_logs(user_id, state);

-- 创建复合索引用于队列查询
CREATE INDEX IF NOT EXISTS idx_study_logs_queue ON study_logs(user_id, state, next_review);

-- 创建 review_logs 表记录复习历史
CREATE TABLE IF NOT EXISTS review_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    word_id VARCHAR(255) NOT NULL,
    study_log_id UUID REFERENCES study_logs(id) ON DELETE CASCADE,
    
    -- 复习详情
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),
    elapsed_days FLOAT NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    review_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    previous_state card_state NOT NULL,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 review_logs 创建索引
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id ON review_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_word_id ON review_logs(word_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_study_log_id ON review_logs(study_log_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_review_time ON review_logs(review_time);

-- 创建用户设置表
CREATE TABLE IF NOT EXISTS user_study_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    
    -- 学习限制
    daily_new_limit INTEGER NOT NULL DEFAULT 20,
    daily_review_limit INTEGER NOT NULL DEFAULT 200,
    
    -- FSRS 参数
    request_retention FLOAT NOT NULL DEFAULT 0.9,
    maximum_interval INTEGER NOT NULL DEFAULT 36500,
    learning_steps INTEGER[] NOT NULL DEFAULT ARRAY[1, 10],
    relearning_steps INTEGER[] NOT NULL DEFAULT ARRAY[10],
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_logs_updated_at 
    BEFORE UPDATE ON study_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_study_settings_updated_at 
    BEFORE UPDATE ON user_study_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建视图用于快速查询
CREATE OR REPLACE VIEW study_queue_view AS
SELECT 
    sl.*,
    CASE 
        WHEN sl.next_review <= NOW() AND sl.state != 'new' THEN 1  -- 复习优先级
        WHEN sl.state = 'new' THEN 2                               -- 新词优先级
        ELSE 3                                                     -- 其他
    END as priority,
    EXTRACT(EPOCH FROM (NOW() - sl.next_review)) / 3600 as overdue_hours
FROM study_logs sl
ORDER BY priority, overdue_hours DESC, sl.next_review ASC;

-- 插入默认用户设置的函数
CREATE OR REPLACE FUNCTION ensure_user_study_settings(p_user_id UUID)
RETURNS user_study_settings AS $$
DECLARE
    settings user_study_settings;
BEGIN
    SELECT * INTO settings FROM user_study_settings WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO user_study_settings (user_id) 
        VALUES (p_user_id) 
        RETURNING * INTO settings;
    END IF;
    
    RETURN settings;
END;
$$ LANGUAGE plpgsql;