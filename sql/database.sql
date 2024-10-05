-- Create Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assessments Table
CREATE TABLE IF NOT EXISTS Assessments (
    assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Trait Descriptions Table
CREATE TABLE IF NOT EXISTS Trait_Descriptions (
    trait_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trait_name TEXT NOT NULL,
    description TEXT,
    context TEXT
);

-- Create Questions Table
CREATE TABLE IF NOT EXISTS Questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    trait_id INTEGER,
    question_order INTEGER,
    FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id),
    FOREIGN KEY (trait_id) REFERENCES Trait_Descriptions(trait_id)
);

-- Create Assessment_Results Table
CREATE TABLE IF NOT EXISTS Assessment_Results (
    result_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    assessment_id INTEGER NOT NULL,
    total_score REAL,
    result_details TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id)
);

-- Create Answers Table
CREATE TABLE IF NOT EXISTS Answers (
    answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_value REAL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);

-- Insert Trait Descriptions
INSERT INTO Trait_Descriptions (trait_name, description) VALUES
('Depression', 'A mood disorder characterized by persistent sadness, loss of interest, and hopelessness.'),
('Anxiety', 'A condition of excessive worry, nervousness, or unease, often with physical symptoms.'),
('Paranoia', 'A mental condition characterized by delusions of persecution, unwarranted jealousy, or exaggerated self-importance.'),
('Schizotypal Symptoms', 'Symptoms that include odd thoughts, behavior, and appearances, as well as magical thinking.'),
('Obsessive-Compulsive Symptoms', 'Characterized by intrusive thoughts and repetitive behaviors or mental acts performed to relieve anxiety.'),
('Honesty-Humility', 'The degree to which a person avoids manipulation, deceit, and unfair treatment of others.'),
('Emotionality', 'The extent to which a person is sensitive to emotional situations, including both positive and negative emotions.'),
('Extraversion', 'The tendency to seek out social interaction, high activity levels, and positive energy.'),
('Agreeableness', 'The degree to which a person tends to get along with others, including cooperation and forgiveness.'),
('Conscientiousness', 'A personality trait characterized by self-discipline, carefulness, and a focus on goal-directed behavior.'),
('Openness to Experience', 'A personality trait that reflects how much a person is open to new ideas, experiences, and creative thinking.'),
('Neuroticism', 'The tendency to experience emotional instability, anxiety, moodiness, and stress.'),
('Machiavellianism', 'A personality trait characterized by manipulation, deceit, and exploitation of others for personal gain.'),
('Narcissism', 'A personality trait characterized by self-centeredness, grandiosity, and a need for admiration.'),
('Psychopathy', 'A personality trait characterized by callousness, lack of empathy, and antisocial behavior.'),
('Sadism', 'A personality trait characterized by deriving pleasure from causing pain or humiliation to others.')
;

-- Insert Assessments
INSERT INTO Assessments (assessment_name, description) VALUES
('Short Dark Triad (SD3)', 'A 27-item measure of the Dark Triad personality traits: Machiavellianism, Narcissism, and Psychopathy.'),
('Dirty Dozen', 'A 12-item concise measure of the Dark Triad personality traits.'),
('Short Dark Tetrad (SD4)', 'A 28-item measure extending the Dark Triad by including Sadism as a fourth trait.'),
('MACH-IV', 'A 20-item scale measuring Machiavellianism.'),
('Big Five Inventory (BFI)', 'A 44-item inventory measuring the Big Five personality traits: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.'),
('HEXACO-60', 'A 60-item inventory measuring six personality traits: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, and Openness to Experience.'),
('MMPI-2-RF', 'A 338-item self-report measure of psychopathology and personality.')
;