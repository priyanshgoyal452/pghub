-- =============================================================
--  PGhub – MySQL Database Schema
--  Run this once to create all tables.
--  Compatible with MySQL 5.7+ / MariaDB 10.3+
-- =============================================================

CREATE DATABASE IF NOT EXISTS pghub
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pghub;

-- ─────────────────────────────────────────────
-- 1. STUDENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255)         NOT NULL,
    email      VARCHAR(255)         NOT NULL UNIQUE,
    password   VARCHAR(255)         NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 2. OWNERS (Landlords)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owners (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255)         NOT NULL,
    email      VARCHAR(255)         NOT NULL UNIQUE,
    password   VARCHAR(255)         NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 3. PG PROPERTIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pgs (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255)         NOT NULL,
    address       VARCHAR(500)         NOT NULL,
    location      VARCHAR(255)         NOT NULL,
    rent          DECIMAL(10,2)        NOT NULL,
    -- Stored as CSV for simplicity (e.g. "WiFi,AC,Laundry")
    facilities    TEXT,
    -- Stored as CSV of image URLs
    images        TEXT,
    contact_phone VARCHAR(20)          NOT NULL,
    contact_email VARCHAR(255),
    gender        ENUM('Boys','Girls','Co-ed')                                NOT NULL,
    furnishing    ENUM('Fully Furnished','Semi Furnished','Unfurnished')      DEFAULT 'Fully Furnished',
    room_type     VARCHAR(100)         DEFAULT 'Single Room',
    description   TEXT,
    owner_id      INT UNSIGNED,
    status        ENUM('Pending','Approved','Rejected','Sold')                DEFAULT 'Pending',
    created_at    DATETIME DEFAULT NOW(),
    updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT fk_pg_owner FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 4. PG REVIEWS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pg_reviews (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pg_id      INT UNSIGNED         NOT NULL,
    user_name  VARCHAR(255)         NOT NULL,
    rating     TINYINT UNSIGNED     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at DATETIME DEFAULT NOW(),
    CONSTRAINT fk_review_pg FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 5. STUDENT SAVED / BOOKMARKED PGs
--    (replaces the MongoDB savedPGs array on Student)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_saved_pgs (
    student_id INT UNSIGNED NOT NULL,
    pg_id      INT UNSIGNED NOT NULL,
    saved_at   DATETIME DEFAULT NOW(),
    PRIMARY KEY (student_id, pg_id),
    CONSTRAINT fk_saved_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_pg      FOREIGN KEY (pg_id)      REFERENCES pgs(id)      ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 6. INQUIRIES (Flatmate board)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id         INT UNSIGNED                          DEFAULT NULL,
    student_name       VARCHAR(255)                          NOT NULL,
    contact_number     VARCHAR(20)                           NOT NULL,
    budget             DECIMAL(10,2)                         NOT NULL,
    preferred_area     VARCHAR(255)                          NOT NULL,
    sharing_type       ENUM('Single','Shared')               NOT NULL,
    gender             ENUM('Boys','Girls','Co-ed')          NOT NULL,
    consent_to_publish TINYINT(1)   DEFAULT 1,
    created_at         DATETIME DEFAULT NOW(),
    updated_at         DATETIME DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT fk_inquiry_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 7. MARKETPLACE ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)                                                                   NOT NULL,
    description TEXT                                                                           NOT NULL,
    price       DECIMAL(10,2)                                                                  NOT NULL,
    category    ENUM('Furniture','Electronics','Books','Vehicles','Appliances','Other')        NOT NULL,
    images      TEXT,
    `condition` ENUM('Like New','Good','Fair','Needs Repair')                                  DEFAULT 'Good',
    phone       VARCHAR(20)                                                                    NOT NULL,
    seller_id   INT UNSIGNED                                                                   NOT NULL,
    status      ENUM('Available','Sold')                                                       DEFAULT 'Available',
    created_at  DATETIME DEFAULT NOW(),
    updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT fk_item_seller FOREIGN KEY (seller_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================
--  Indexes for common query patterns
-- =============================================================
CREATE INDEX idx_pgs_status   ON pgs(status);
CREATE INDEX idx_pgs_location ON pgs(location);
CREATE INDEX idx_pgs_owner    ON pgs(owner_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_seller ON items(seller_id);
CREATE INDEX idx_inquiries_consent ON inquiries(consent_to_publish);

-- =============================================================
--  Done!  Connect with: DB_NAME=pghub, DB_USER=root, DB_PASS=''
-- =============================================================
