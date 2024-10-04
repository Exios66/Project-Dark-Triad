-- Create Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assessments Table
CREATE TABLE Assessments (
    assessment_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Questions Table
CREATE TABLE Questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    question_text TEXT NOT NULL,
    trait_id INT,
    question_order INT,
    FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id),
    FOREIGN KEY (trait_id) REFERENCES Trait_Descriptions(trait_id)
);

-- Create Trait Descriptions Table
CREATE TABLE Trait_Descriptions (
    trait_id INT AUTO_INCREMENT PRIMARY KEY,
    trait_name VARCHAR(50) NOT NULL,
    description TEXT,
    context TEXT
);

-- Create Assessment_Results Table
CREATE TABLE Assessment_Results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_id INT NOT NULL,
    total_score DECIMAL(5,2),
    result_details JSON,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id)
);

-- Create Answers Table
CREATE TABLE Answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_value DECIMAL(3,2),
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
('Sadism', 'A personality trait characterized by deriving pleasure from causing pain or humiliation to others.');

-- Insert Dirty Dozen Questions
INSERT INTO Questions (assessment_id, question_text, question_order) VALUES
(3, 'I tend to manipulate others to get my way.', 1),
(3, 'I tend to lack remorse.', 2),
(3, 'I tend to want others to admire me.', 3),
(3, 'I tend to be unconcerned with the morality of my actions.', 4),
(3, 'I have used deceit or lied to get my way.', 5),
(3, 'I tend to be callous or insensitive.', 6),
(3, 'I have used flattery to get my way.', 7),
(3, 'I tend to seek prestige or status.', 8),
(3, 'I tend to be cynical.', 9),
(3, 'I tend to exploit others toward my own end.', 10),
(3, 'I tend to expect special favors from others.', 11),
(3, 'I want others to pay attention to me.', 12);

-- Insert Mach-IV Questions
INSERT INTO Questions (assessment_id, question_text, question_order) VALUES
(4, "Never tell anyone the real reason you did something unless it is useful to do so.", 1),
(4, "The best way to handle people is to tell them what they want to hear.", 2),
(4, "One should take action only when sure it is morally right.", 3), -- Reversed
(4, "Most people are basically good and kind.", 4), -- Reversed
(4, "It is safest to assume that all people have a vicious streak and it will come out when they are given a chance.", 5),
(4, "Honesty is the best policy in all cases.", 6), -- Reversed
(4, "There is no excuse for lying to someone else.", 7), -- Reversed
(4, "Generally speaking, people won't work hard unless they're forced to do so.", 8),
(4, "All in all, it is better to be humble and honest than to be important and dishonest.", 9), -- Reversed
(4, "When you ask someone to do something for you, it is best to give the real reasons for wanting it rather than giving reasons which carry more weight.", 10), -- Reversed
(4, "Most people who get ahead in the world lead clean, moral lives.", 11), -- Reversed
(4, "Anyone who completely trusts anyone else is asking for trouble.", 12),
(4, "The biggest difference between most criminals and other people is that the criminals are stupid enough to get caught.", 13),
(4, "Most people are brave.", 14), -- Reversed
(4, "It is wise to flatter important people.", 15),
(4, "It is possible to be good in all respects.", 16), -- Reversed
(4, "P.T. Barnum was wrong when he said that there's a sucker born every minute.", 17), -- Reversed
(4, "It is hard to get ahead without cutting corners here and there.", 18),
(4, "People suffering from incurable diseases should have the choice of being put painlessly to death.", 19),
(4, "Most people forget more easily the death of their parents than the loss of their property.", 20);

-- Insert SDT3 Questions
INSERT INTO Questions (assessment_id, question_text, question_order) VALUES
(2, "It's not wise to tell your secrets.", 1),
(2, "People see me as a natural leader.", 2),
(2, "I like to get revenge on authorities.", 3),
(2, "I like to use clever manipulation to get my way.", 4),
(2, "I hate being the center of attention.", 5), -- Reversed
(2, "I avoid dangerous situations at all costs.", 6), -- Reversed
(2, "Whatever it takes, you must get the important people on your side.", 7),
(2, "Many group activities tend to be dull without me.", 8),
(2, "Payback needs to be quick and nasty.", 9),
(2, "Avoid direct conflict with others because they may be useful in the future.", 10),
(2, "I know that I am special because everyone keeps telling me so.", 11),
(2, "People often say I’m out of control.", 12), -- Reversed
(2, "It's wise to keep track of information that you can use against people later.", 13),
(2, "I like to get acquainted with important people.", 14),
(2, "It’s true that I can be mean to others.", 15),
(2, "You should wait for the right time to get back at people.", 16),
(2, "I feel embarrassed if someone compliments me.", 17), -- Reversed
(2, "People who mess with me always regret it.", 18),
(2, "There are things you should hide from other people because they don't need to know.", 19),
(2, "I have been compared to famous people.", 20),
(2, "I have never gotten into trouble with the law.", 21), -- Reversed
(2, "Make sure your plans benefit you, not others.", 22),
(2, "I am just an average person.", 23), -- Reversed
(2, "I enjoy having sex with people I hardly know.", 24),
(2, "Most people can be easily manipulated.", 25),
(2, "I insist on getting the respect I deserve.", 26),
(2, "I'll say anything to get what I want.", 27);

-- Insert SDT4 Questions
INSERT INTO Questions (assessment_id, question_text, question_order) VALUES
(5, 'I love to watch YouTube clips of people fighting.', 1),
(5, 'I enjoy watching violent sports.', 2),
(5, 'Some people deserve to suffer.', 3),
(5, 'Just for kicks, I\'ve said mean things on social media.', 4),
(5, 'I know how to hurt someone with words alone.', 5),
(5, 'I enjoy making jokes at the expense of others.', 6),
(5, 'I have fantasies about hurting people who have wronged me.', 7);

-- Insert MMPI Questions
INSERT INTO Questions (assessment_id, question_text, trait_id, question_order) VALUES
(6, 'I often feel hopeless about the future.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Depression'), 1),
(6, 'I struggle to find joy in things I once enjoyed.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Depression'), 2),
(6, 'I wake up feeling more tired than before I went to bed.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Depression'), 3),
(6, 'I have difficulty concentrating on even simple tasks.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Depression'), 4),
(6, 'I find myself withdrawing from people and activities.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Depression'), 5),
(6, 'I frequently feel nervous or on edge without reason.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Anxiety'), 6),
(6, 'My thoughts often race uncontrollably.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Anxiety'), 7),
(6, 'I avoid situations that might make me feel panicked.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Anxiety'), 8),
(6, 'I have recurring nightmares or bad dreams.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Anxiety'), 9),
(6, 'My heart often pounds or I feel short of breath, even when I am not exerting myself.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Anxiety'), 10),
(6, 'I believe people are often out to get me.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Paranoia'), 11),
(6, 'I find myself questioning the motives of others.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Paranoia'), 12),
(6, 'I feel like I am constantly being watched or followed.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Paranoia'), 13),
(6, 'I have trouble trusting people, even those close to me.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Paranoia'), 14),
(6, 'I feel like others are discussing me behind my back.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Paranoia'), 15),
(6, 'I experience odd or unusual thoughts that others might not understand.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Schizotypal Symptoms'), 16),
(6, 'I often feel disconnected from my surroundings, like I am in a dream.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Schizotypal Symptoms'), 17),
(6, 'I believe that I have special powers or insights others don’t have.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Schizotypal Symptoms'), 18),
(6, 'I sometimes hear things that other people say they cannot hear.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Schizotypal Symptoms'), 19),
(6, 'I have unusual sensory experiences, like seeing things in my peripheral vision that aren’t there.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Schizotypal Symptoms'), 20),
(6, 'I feel an overwhelming need to check things repeatedly.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Obsessive-Compulsive Symptoms'), 21),
(6, 'I get uncomfortable if things are not in a specific order.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Obsessive-Compulsive Symptoms'), 22),
(6, 'I often have intrusive thoughts that I can’t seem to shake off.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Obsessive-Compulsive Symptoms'), 23),
(6, 'I spend a lot of time performing rituals to calm myself.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Obsessive-Compulsive Symptoms'), 24),
(6, 'I feel anxious when I can’t complete a task perfectly.', (SELECT trait_id FROM Trait_Descriptions WHERE trait_name = 'Obsessive-Compulsive Symptoms'), 25);
