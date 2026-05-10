-- =============================================================
--  TRAVELOOP — MySQL Schema
--  Compatible with: MySQL 8.0+
--  Run in DBeaver: Open SQL Editor → Paste → Execute All (F5)
--  Creates: all tables, indexes, triggers, views, seed data
-- =============================================================

-- Drop and recreate the database cleanly
CREATE DATABASE IF NOT EXISTS traveloop
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE traveloop;

-- Disable FK checks during setup
SET FOREIGN_KEY_CHECKS = 0;


-- =============================================================
-- 1. USERS
-- =============================================================
CREATE TABLE users (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    avatar_url      TEXT,
    language        VARCHAR(10)     NOT NULL DEFAULT 'en',
    is_admin        TINYINT(1)      NOT NULL DEFAULT 0,
    is_deleted      TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 2. CITIES
-- =============================================================
CREATE TABLE cities (
    id               CHAR(36)       NOT NULL DEFAULT (UUID()),
    name             VARCHAR(120)   NOT NULL,
    country          VARCHAR(100)   NOT NULL,
    region           VARCHAR(100),
    cost_index       DECIMAL(5,2)   NOT NULL DEFAULT 50.00,
    popularity_score INT            NOT NULL DEFAULT 0,
    image_url        TEXT,
    latitude         DECIMAL(9,6),
    longitude        DECIMAL(9,6),
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_cities_country      (country, name),
    KEY idx_cities_popularity   (popularity_score DESC),
    KEY idx_cities_geo          (latitude, longitude),
    FULLTEXT KEY ft_cities_search (name, country, region),

    CONSTRAINT chk_cost_index CHECK (cost_index BETWEEN 0 AND 100),
    CONSTRAINT chk_popularity CHECK (popularity_score >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 3. ACTIVITIES
-- =============================================================
CREATE TABLE activities (
    id               CHAR(36)       NOT NULL DEFAULT (UUID()),
    city_id          CHAR(36)       NOT NULL,
    name             VARCHAR(200)   NOT NULL,
    description      TEXT,
    category         VARCHAR(60)    NOT NULL DEFAULT 'other',
    estimated_cost   DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    duration_minutes INT,
    image_url        TEXT,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_activities_city_cat  (city_id, category),
    KEY idx_activities_cost      (city_id, estimated_cost),
    FULLTEXT KEY ft_activities_search (name, description),

    CONSTRAINT chk_activity_category CHECK (
        category IN ('sightseeing','food','adventure','culture','nightlife','shopping','wellness','other')
    ),
    CONSTRAINT chk_activity_cost CHECK (estimated_cost >= 0),
    CONSTRAINT chk_activity_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0),

    CONSTRAINT fk_activities_city
        FOREIGN KEY (city_id) REFERENCES cities (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 4. TRIPS
-- =============================================================
CREATE TABLE trips (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)        NOT NULL,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    cover_photo_url TEXT,
    budget_limit    DECIMAL(10,2),
    is_public       TINYINT(1)      NOT NULL DEFAULT 0,
    slug            VARCHAR(80)     NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_trips_slug    (slug),
    KEY idx_trips_user_date     (user_id, start_date DESC),
    KEY idx_trips_public        (is_public, created_at DESC),

    CONSTRAINT chk_trip_dates   CHECK (end_date >= start_date),
    CONSTRAINT chk_budget_limit CHECK (budget_limit IS NULL OR budget_limit >= 0),

    CONSTRAINT fk_trips_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 5. TRIP STOPS
-- =============================================================
CREATE TABLE trip_stops (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    trip_id         CHAR(36)        NOT NULL,
    city_id         CHAR(36)        NOT NULL,
    arrive_date     DATE            NOT NULL,
    depart_date     DATE            NOT NULL,
    order_index     INT             NOT NULL DEFAULT 0,
    budget_for_stop DECIMAL(10,2),
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_stop_order        (trip_id, order_index),
    KEY idx_stops_trip_order        (trip_id, order_index ASC),
    KEY idx_stops_city              (city_id),

    CONSTRAINT chk_stop_dates CHECK (depart_date >= arrive_date),
    CONSTRAINT chk_stop_budget CHECK (budget_for_stop IS NULL OR budget_for_stop >= 0),

    CONSTRAINT fk_stops_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stops_city
        FOREIGN KEY (city_id) REFERENCES cities (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 6. STOP ACTIVITIES
-- =============================================================
CREATE TABLE stop_activities (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    stop_id         CHAR(36)        NOT NULL,
    activity_id     CHAR(36)        NOT NULL,
    scheduled_time  TIME,
    actual_cost     DECIMAL(10,2),
    order_index     INT             NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_stop_activity     (stop_id, activity_id),
    KEY idx_stop_act_stop           (stop_id, order_index ASC),
    KEY idx_stop_act_activity       (activity_id),

    CONSTRAINT chk_actual_cost CHECK (actual_cost IS NULL OR actual_cost >= 0),

    CONSTRAINT fk_stop_act_stop
        FOREIGN KEY (stop_id) REFERENCES trip_stops (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stop_act_activity
        FOREIGN KEY (activity_id) REFERENCES activities (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 7. TRIP EXPENSES
-- =============================================================
CREATE TABLE trip_expenses (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    trip_id         CHAR(36)        NOT NULL,
    stop_id         CHAR(36)        NULL,
    category        VARCHAR(60)     NOT NULL DEFAULT 'other',
    label           VARCHAR(200),
    amount          DECIMAL(10,2)   NOT NULL,
    expense_date    DATE            NOT NULL,
    notes           TEXT,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_expenses_trip_cat   (trip_id, category),
    KEY idx_expenses_trip_date  (trip_id, expense_date),
    KEY idx_expenses_stop       (stop_id),

    CONSTRAINT chk_expense_amount CHECK (amount >= 0),
    CONSTRAINT chk_expense_category CHECK (
        category IN ('transport','accommodation','activities','meals','other')
    ),

    CONSTRAINT fk_expenses_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_stop
        FOREIGN KEY (stop_id) REFERENCES trip_stops (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 8. PACKING ITEMS
-- =============================================================
CREATE TABLE packing_items (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    trip_id         CHAR(36)        NOT NULL,
    name            VARCHAR(200)    NOT NULL,
    category        VARCHAR(60)     NOT NULL DEFAULT 'other',
    is_packed       TINYINT(1)      NOT NULL DEFAULT 0,
    order_index     INT             NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_packing_trip_cat (trip_id, category, order_index),

    CONSTRAINT chk_packing_category CHECK (
        category IN ('clothing','documents','electronics','toiletries','medicines','other')
    ),

    CONSTRAINT fk_packing_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 9. TRIP NOTES
-- =============================================================
CREATE TABLE trip_notes (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    trip_id         CHAR(36)        NOT NULL,
    stop_id         CHAR(36)        NULL,
    content         TEXT            NOT NULL,
    note_date       DATE            NOT NULL DEFAULT (CURRENT_DATE),
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_notes_trip_date (trip_id, note_date DESC),
    KEY idx_notes_stop      (stop_id),

    CONSTRAINT fk_notes_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notes_stop
        FOREIGN KEY (stop_id) REFERENCES trip_stops (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 10. SHARED TRIPS
-- =============================================================
CREATE TABLE shared_trips (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    trip_id         CHAR(36)        NOT NULL,
    public_token    VARCHAR(40)     NOT NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    view_count      INT             NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_shared_trip_id    (trip_id),
    UNIQUE KEY uq_shared_token      (public_token),
    KEY idx_shared_token_active     (public_token, is_active),

    CONSTRAINT chk_view_count CHECK (view_count >= 0),

    CONSTRAINT fk_shared_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 11. SAVED DESTINATIONS
-- =============================================================
CREATE TABLE saved_destinations (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)        NOT NULL,
    city_id         CHAR(36)        NOT NULL,
    saved_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_saved_dest        (user_id, city_id),
    KEY idx_saved_user              (user_id, saved_at DESC),

    CONSTRAINT fk_saved_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_saved_city
        FOREIGN KEY (city_id) REFERENCES cities (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 12. VIEWS  (Analytics / Admin Dashboard)
-- =============================================================

-- Top cities by trip stop frequency
CREATE OR REPLACE VIEW vw_top_cities AS
    SELECT
        c.id,
        c.name,
        c.country,
        c.region,
        c.cost_index,
        c.popularity_score,
        c.image_url,
        COUNT(ts.id) AS stop_count
    FROM cities c
    LEFT JOIN trip_stops ts ON ts.city_id = c.id
    GROUP BY c.id, c.name, c.country, c.region, c.cost_index, c.popularity_score, c.image_url
    ORDER BY stop_count DESC;

-- Top activities by usage
CREATE OR REPLACE VIEW vw_top_activities AS
    SELECT
        a.id,
        a.name,
        a.category,
        c.name                                              AS city_name,
        COUNT(sa.id)                                        AS usage_count,
        AVG(COALESCE(sa.actual_cost, a.estimated_cost))     AS avg_cost
    FROM activities a
    JOIN cities c                ON c.id = a.city_id
    LEFT JOIN stop_activities sa ON sa.activity_id = a.id
    GROUP BY a.id, a.name, a.category, c.name
    ORDER BY usage_count DESC;

-- Daily trip creation stats
CREATE OR REPLACE VIEW vw_trip_stats AS
    SELECT
        DATE(created_at)                        AS day,
        COUNT(*)                                AS trips_created,
        AVG(DATEDIFF(end_date, start_date))     AS avg_duration_days,
        SUM(is_public)                          AS public_trips
    FROM trips
    GROUP BY DATE(created_at)
    ORDER BY day DESC;

-- User engagement summary
CREATE OR REPLACE VIEW vw_user_engagement AS
    SELECT
        u.id,
        u.name,
        u.email,
        u.created_at,
        COUNT(DISTINCT t.id)    AS total_trips,
        MAX(t.created_at)       AS last_trip_at
    FROM users u
    LEFT JOIN trips t ON t.user_id = u.id
    WHERE u.is_deleted = 0
    GROUP BY u.id, u.name, u.email, u.created_at
    ORDER BY total_trips DESC;

-- Budget summary per trip (Budget & Cost Breakdown screen)
CREATE OR REPLACE VIEW vw_trip_budget_summary AS
    SELECT
        t.id                                                            AS trip_id,
        t.name                                                          AS trip_name,
        t.budget_limit,
        COALESCE(SUM(e.amount), 0)                                      AS total_spent,
        t.budget_limit - COALESCE(SUM(e.amount), 0)                    AS remaining,
        SUM(CASE WHEN e.category = 'transport'     THEN e.amount ELSE 0 END) AS transport_cost,
        SUM(CASE WHEN e.category = 'accommodation' THEN e.amount ELSE 0 END) AS accommodation_cost,
        SUM(CASE WHEN e.category = 'activities'    THEN e.amount ELSE 0 END) AS activities_cost,
        SUM(CASE WHEN e.category = 'meals'         THEN e.amount ELSE 0 END) AS meals_cost,
        SUM(CASE WHEN e.category = 'other'         THEN e.amount ELSE 0 END) AS other_cost
    FROM trips t
    LEFT JOIN trip_expenses e ON e.trip_id = t.id
    GROUP BY t.id, t.name, t.budget_limit;


-- =============================================================
-- 13. SEED DATA
-- =============================================================

-- Demo users  (password for both = 'password123', bcrypt hashed)
INSERT INTO users (id, name, email, password_hash, language, is_admin) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Demo User',
    'demo@traveloop.com',
    '$2a$12$F48lwbX1YbbzK9qIER0pNehjzxBAruT/KqyPTNEO3GknYA8lxZvOy',
    'en', 0
),
(
    '00000000-0000-0000-0000-000000000002',
    'Admin',
    'admin@traveloop.com',
    '$2a$12$F48lwbX1YbbzK9qIER0pNehjzxBAruT/KqyPTNEO3GknYA8lxZvOy',
    'en', 1
);

-- 50 Global Cities
INSERT INTO cities (id, name, country, region, cost_index, popularity_score, latitude, longitude) VALUES
('c0000001-0000-0000-0000-000000000001', 'Paris',          'France',         'Europe',         72, 98,  48.856600,   2.352200),
('c0000001-0000-0000-0000-000000000002', 'Tokyo',          'Japan',          'Asia',           68, 97,  35.676200, 139.650300),
('c0000001-0000-0000-0000-000000000003', 'New York',       'USA',            'North America',  85, 96,  40.712800, -74.006000),
('c0000001-0000-0000-0000-000000000004', 'Rome',           'Italy',          'Europe',         65, 94,  41.902800,  12.496400),
('c0000001-0000-0000-0000-000000000005', 'Barcelona',      'Spain',          'Europe',         60, 93,  41.385100,   2.173400),
('c0000001-0000-0000-0000-000000000006', 'Bangkok',        'Thailand',       'Asia',           30, 95,  13.756300, 100.501800),
('c0000001-0000-0000-0000-000000000007', 'London',         'UK',             'Europe',         88, 96,  51.507400,  -0.127800),
('c0000001-0000-0000-0000-000000000008', 'Sydney',         'Australia',      'Oceania',        78, 90, -33.868800, 151.209300),
('c0000001-0000-0000-0000-000000000009', 'Dubai',          'UAE',            'Middle East',    75, 92,  25.204800,  55.270800),
('c0000001-0000-0000-0000-000000000010', 'Singapore',      'Singapore',      'Asia',           80, 91,   1.352100, 103.819800),
('c0000001-0000-0000-0000-000000000011', 'Amsterdam',      'Netherlands',    'Europe',         70, 88,  52.367600,   4.904100),
('c0000001-0000-0000-0000-000000000012', 'Istanbul',       'Turkey',         'Europe',         42, 89,  41.008200,  28.978400),
('c0000001-0000-0000-0000-000000000013', 'Prague',         'Czech Republic', 'Europe',         45, 87,  50.075500,  14.437800),
('c0000001-0000-0000-0000-000000000014', 'Vienna',         'Austria',        'Europe',         68, 86,  48.208200,  16.373800),
('c0000001-0000-0000-0000-000000000015', 'Lisbon',         'Portugal',       'Europe',         50, 88,  38.722300,  -9.139300),
('c0000001-0000-0000-0000-000000000016', 'Bali',           'Indonesia',      'Asia',           25, 94,  -8.340500, 115.092000),
('c0000001-0000-0000-0000-000000000017', 'Seoul',          'South Korea',    'Asia',           60, 89,  37.566500, 126.978000),
('c0000001-0000-0000-0000-000000000018', 'Mexico City',    'Mexico',         'Latin America',  35, 82,  19.432600, -99.133200),
('c0000001-0000-0000-0000-000000000019', 'Buenos Aires',   'Argentina',      'Latin America',  28, 80, -34.603700, -58.381600),
('c0000001-0000-0000-0000-000000000020', 'Cape Town',      'South Africa',   'Africa',         40, 84, -33.924900,  18.424100),
('c0000001-0000-0000-0000-000000000021', 'Santorini',      'Greece',         'Europe',         76, 91,  36.393400,  25.461500),
('c0000001-0000-0000-0000-000000000022', 'Kyoto',          'Japan',          'Asia',           62, 90,  35.011600, 135.768000),
('c0000001-0000-0000-0000-000000000023', 'Marrakech',      'Morocco',        'Africa',         32, 86,  31.628200,  -7.992700),
('c0000001-0000-0000-0000-000000000024', 'New Delhi',      'India',          'Asia',           22, 83,  28.613900,  77.209000),
('c0000001-0000-0000-0000-000000000025', 'Mumbai',         'India',          'Asia',           24, 81,  19.076000,  72.877400),
('c0000001-0000-0000-0000-000000000026', 'Toronto',        'Canada',         'North America',  74, 82,  43.651100, -79.347000),
('c0000001-0000-0000-0000-000000000027', 'Vancouver',      'Canada',         'North America',  72, 83,  49.282700,-123.120700),
('c0000001-0000-0000-0000-000000000028', 'Rio de Janeiro', 'Brazil',         'Latin America',  38, 87, -22.906800, -43.172900),
('c0000001-0000-0000-0000-000000000029', 'Zurich',         'Switzerland',    'Europe',         95, 79,  47.376900,   8.541700),
('c0000001-0000-0000-0000-000000000030', 'Copenhagen',     'Denmark',        'Europe',         86, 80,  55.676100,  12.568300),
('c0000001-0000-0000-0000-000000000031', 'Budapest',       'Hungary',        'Europe',         43, 85,  47.497900,  19.039700),
('c0000001-0000-0000-0000-000000000032', 'Athens',         'Greece',         'Europe',         55, 86,  37.983900,  23.727500),
('c0000001-0000-0000-0000-000000000033', 'Cairo',          'Egypt',          'Africa',         20, 85,  30.044400,  31.235700),
('c0000001-0000-0000-0000-000000000034', 'Nairobi',        'Kenya',          'Africa',         30, 72,  -1.286400,  36.817200),
('c0000001-0000-0000-0000-000000000035', 'Hanoi',          'Vietnam',        'Asia',           18, 84,  21.027600, 105.834200),
('c0000001-0000-0000-0000-000000000036', 'Ho Chi Minh',    'Vietnam',        'Asia',           18, 83,  10.823100, 106.629700),
('c0000001-0000-0000-0000-000000000037', 'Kuala Lumpur',   'Malaysia',       'Asia',           32, 82,   3.139000, 101.686900),
('c0000001-0000-0000-0000-000000000038', 'Manila',         'Philippines',    'Asia',           22, 74,  14.599500, 120.984200),
('c0000001-0000-0000-0000-000000000039', 'Lagos',          'Nigeria',        'Africa',         28, 65,   6.524400,   3.379200),
('c0000001-0000-0000-0000-000000000040', 'Johannesburg',   'South Africa',   'Africa',         38, 70, -26.204100,  28.047300),
('c0000001-0000-0000-0000-000000000041', 'Los Angeles',    'USA',            'North America',  82, 91,  34.052200,-118.243700),
('c0000001-0000-0000-0000-000000000042', 'Chicago',        'USA',            'North America',  75, 84,  41.878100, -87.629800),
('c0000001-0000-0000-0000-000000000043', 'Miami',          'USA',            'North America',  78, 88,  25.774500, -80.194700),
('c0000001-0000-0000-0000-000000000044', 'Edinburgh',      'UK',             'Europe',         72, 83,  55.953300,  -3.188300),
('c0000001-0000-0000-0000-000000000045', 'Dublin',         'Ireland',        'Europe',         74, 80,  53.349800,  -6.260300),
('c0000001-0000-0000-0000-000000000046', 'Brussels',       'Belgium',        'Europe',         68, 77,  50.850300,   4.351700),
('c0000001-0000-0000-0000-000000000047', 'Stockholm',      'Sweden',         'Europe',         84, 79,  59.332600,  18.064900),
('c0000001-0000-0000-0000-000000000048', 'Oslo',           'Norway',         'Europe',         92, 75,  59.913900,  10.752200),
('c0000001-0000-0000-0000-000000000049', 'Maldives',       'Maldives',       'Asia',           90, 93,   3.202800,  73.220700),
('c0000001-0000-0000-0000-000000000050', 'Phuket',         'Thailand',       'Asia',           35, 89,   7.878900,  98.398300);

-- Activities (5 per city for key cities)
INSERT INTO activities (id, city_id, name, description, category, estimated_cost, duration_minutes) VALUES
-- Paris
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Eiffel Tower Visit',     'Skip-the-line access to all 3 floors',       'sightseeing', 30.00, 120),
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Louvre Museum',          'World-famous art museum',                    'culture',     20.00, 240),
('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Seine River Cruise',     'Scenic 1-hour boat cruise',                  'sightseeing', 15.00,  60),
('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001', 'French Cooking Class',   'Learn to make croissants and sauces',        'food',        85.00, 180),
('a0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000001', 'Montmartre Walk',        'Explore the artist village and Sacre-Coeur', 'sightseeing',  0.00,  90),
-- Tokyo
('a0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000002', 'Senso-ji Temple',        'Ancient Buddhist temple in Asakusa',         'culture',      0.00,  60),
('a0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000002', 'Shibuya Crossing',       'Most famous pedestrian crossing in world',   'sightseeing',  0.00,  30),
('a0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000002', 'Tsukiji Fish Market',    'Morning tuna auction and sushi breakfast',   'food',        25.00, 120),
('a0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000002', 'teamLab Planets',        'Immersive digital art museum',               'culture',     30.00,  90),
('a0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000002', 'Mt Fuji Day Trip',       'Guided day trip to iconic volcano',          'adventure',   80.00, 480),
-- Bali
('a0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000016', 'Ubud Monkey Forest',     'Sacred forest sanctuary with monkeys',       'sightseeing',  5.00,  90),
('a0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000016', 'Tanah Lot Temple',       'Stunning sea temple at sunset',              'culture',      5.00,  60),
('a0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000016', 'White Water Rafting',    'Ayung River rafting adventure',              'adventure',   35.00, 150),
('a0000001-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000016', 'Balinese Cooking Class', 'Market visit and cook traditional dishes',   'food',        30.00, 240),
('a0000001-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000016', 'Kuta Beach Surfing',     'Beginner surf lessons at Kuta beach',        'adventure',   20.00, 120),
-- Bangkok
('a0000001-0000-0000-0000-000000000016', 'c0000001-0000-0000-0000-000000000006', 'Grand Palace',           'Iconic royal palace complex',                'culture',     15.00, 150),
('a0000001-0000-0000-0000-000000000017', 'c0000001-0000-0000-0000-000000000006', 'Wat Pho Temple',         'Massive reclining Buddha statue',            'culture',      4.00,  60),
('a0000001-0000-0000-0000-000000000018', 'c0000001-0000-0000-0000-000000000006', 'Street Food Night Tour', 'Eat your way through Bangkok street food',   'food',        25.00, 180),
('a0000001-0000-0000-0000-000000000019', 'c0000001-0000-0000-0000-000000000006', 'Chao Phraya River Tour', 'Long-tail boat tour on the river',           'sightseeing', 10.00,  90),
('a0000001-0000-0000-0000-000000000020', 'c0000001-0000-0000-0000-000000000006', 'Muay Thai Evening',      'Live Muay Thai boxing match',                'culture',     40.00, 150),
-- London
('a0000001-0000-0000-0000-000000000021', 'c0000001-0000-0000-0000-000000000007', 'Tower of London',        'Historic castle and Crown Jewels',           'culture',     35.00, 150),
('a0000001-0000-0000-0000-000000000022', 'c0000001-0000-0000-0000-000000000007', 'British Museum',         'World-class history museum, free entry',     'culture',      0.00, 180),
('a0000001-0000-0000-0000-000000000023', 'c0000001-0000-0000-0000-000000000007', 'West End Show',          'Top-tier musical theatre performance',       'culture',     90.00, 180),
('a0000001-0000-0000-0000-000000000024', 'c0000001-0000-0000-0000-000000000007', 'Afternoon Tea',          'Traditional tea at a classic hotel',         'food',        55.00,  90),
('a0000001-0000-0000-0000-000000000025', 'c0000001-0000-0000-0000-000000000007', 'Thames Walk',            'Walk along Southbank to Tower Bridge',       'sightseeing',  0.00, 120),
-- Dubai
('a0000001-0000-0000-0000-000000000026', 'c0000001-0000-0000-0000-000000000009', 'Burj Khalifa Top',       'Observation deck on floor 148',              'sightseeing', 50.00,  90),
('a0000001-0000-0000-0000-000000000027', 'c0000001-0000-0000-0000-000000000009', 'Desert Safari',          'Dune bashing, camel ride and BBQ dinner',   'adventure',   85.00, 360),
('a0000001-0000-0000-0000-000000000028', 'c0000001-0000-0000-0000-000000000009', 'Dubai Mall',             'Worlds largest mall and aquarium',           'shopping',     0.00, 180),
('a0000001-0000-0000-0000-000000000029', 'c0000001-0000-0000-0000-000000000009', 'Dhow Dinner Cruise',     'Traditional boat dinner on Dubai Creek',     'food',        70.00, 180),
('a0000001-0000-0000-0000-000000000030', 'c0000001-0000-0000-0000-000000000009', 'Gold Souk',              'Explore the famous gold market',             'shopping',     0.00,  90);

-- Sample trip for demo user
INSERT INTO trips (id, user_id, name, description, start_date, end_date, budget_limit, is_public, slug)
VALUES (
    't0000001-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Europe & Bali Dream Trip',
    'Two weeks exploring Paris and unwinding in Bali',
    '2026-06-01', '2026-06-15',
    3500.00, 1, 'europe-bali-dream-2026'
);

-- Stops
INSERT INTO trip_stops (id, trip_id, city_id, arrive_date, depart_date, order_index, budget_for_stop) VALUES
('s0000001-0000-0000-0000-000000000001', 't0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', '2026-06-01', '2026-06-07', 10, 1500.00),
('s0000001-0000-0000-0000-000000000002', 't0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000016','2026-06-08', '2026-06-15', 20, 1200.00);

-- Activities on stops
INSERT INTO stop_activities (id, stop_id, activity_id, order_index) VALUES
('sa000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 10),
('sa000001-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 20),
('sa000001-0000-0000-0000-000000000003', 's0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 30),
('sa000001-0000-0000-0000-000000000004', 's0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000011', 10),
('sa000001-0000-0000-0000-000000000005', 's0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000013', 20);

-- Expenses
INSERT INTO trip_expenses (id, trip_id, stop_id, category, label, amount, expense_date) VALUES
('e0000001-0000-0000-0000-000000000001', 't0000001-0000-0000-0000-000000000001', NULL,                                    'transport',     'Flights round-trip',             850.00, '2026-06-01'),
('e0000001-0000-0000-0000-000000000002', 't0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'accommodation', 'Hotel Eiffel Paris (6 nights)',   720.00, '2026-06-01'),
('e0000001-0000-0000-0000-000000000003', 't0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'activities',    'Eiffel Tower + Louvre combo',     50.00, '2026-06-02'),
('e0000001-0000-0000-0000-000000000004', 't0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000002', 'accommodation', 'Villa Ubud Bali (7 nights)',      560.00, '2026-06-08'),
('e0000001-0000-0000-0000-000000000005', 't0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000002', 'activities',    'Rafting + Cooking Class',         65.00, '2026-06-10');

-- Packing list
INSERT INTO packing_items (id, trip_id, name, category, is_packed, order_index) VALUES
('p0000001-0000-0000-0000-000000000001', 't0000001-0000-0000-0000-000000000001', 'Passport',         'documents',   0, 10),
('p0000001-0000-0000-0000-000000000002', 't0000001-0000-0000-0000-000000000001', 'Travel Insurance', 'documents',   0, 20),
('p0000001-0000-0000-0000-000000000003', 't0000001-0000-0000-0000-000000000001', 'T-Shirts x5',      'clothing',    0, 10),
('p0000001-0000-0000-0000-000000000004', 't0000001-0000-0000-0000-000000000001', 'Swimwear',         'clothing',    0, 20),
('p0000001-0000-0000-0000-000000000005', 't0000001-0000-0000-0000-000000000001', 'Phone Charger',    'electronics', 0, 10),
('p0000001-0000-0000-0000-000000000006', 't0000001-0000-0000-0000-000000000001', 'Sunscreen SPF50',  'toiletries',  0, 10);

-- Trip note
INSERT INTO trip_notes (id, trip_id, stop_id, content, note_date) VALUES
(
    'n0000001-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    's0000001-0000-0000-0000-000000000001',
    'Hotel check-in after 2pm. Ask for the room facing the Eiffel Tower. Grab croissants from the bakery downstairs every morning.',
    '2026-06-01'
);

-- Shared trip
INSERT INTO shared_trips (id, trip_id, public_token, is_active) VALUES
(
    'sh000001-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    'TL-EuropeBali2026-xK9mZ2',
    1
);

-- Re-enable FK checks
SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================
-- QUICK VERIFY (uncomment and run after execution)
-- =============================================================
-- SELECT 'users'             AS tbl, COUNT(*) AS rows FROM users
-- UNION ALL
-- SELECT 'cities',            COUNT(*) FROM cities
-- UNION ALL
-- SELECT 'activities',        COUNT(*) FROM activities
-- UNION ALL
-- SELECT 'trips',             COUNT(*) FROM trips
-- UNION ALL
-- SELECT 'trip_stops',        COUNT(*) FROM trip_stops
-- UNION ALL
-- SELECT 'stop_activities',   COUNT(*) FROM stop_activities
-- UNION ALL
-- SELECT 'trip_expenses',     COUNT(*) FROM trip_expenses
-- UNION ALL
-- SELECT 'packing_items',     COUNT(*) FROM packing_items
-- UNION ALL
-- SELECT 'trip_notes',        COUNT(*) FROM trip_notes
-- UNION ALL
-- SELECT 'shared_trips',      COUNT(*) FROM shared_trips
-- UNION ALL
-- SELECT 'saved_destinations', COUNT(*) FROM saved_destinations;
--
-- SELECT * FROM vw_trip_budget_summary;
-- SELECT * FROM vw_top_cities LIMIT 10;
-- =============================================================
