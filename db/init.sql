CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  user_wallet_id TEXT
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  creator TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  raised NUMERIC DEFAULT 0,
  goal NUMERIC NOT NULL,
  backers INTEGER DEFAULT 0,
  days_left INTEGER DEFAULT 0,
  badge TEXT,
  front_pic TEXT,
  redirect_link TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_recommended BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE
);

-- Seed users
INSERT INTO users (username, password, user_wallet_id) VALUES
  ('alice', 'hashed_password_1', 'rAlice1234XRPWalletAddress'),
  ('bob',   'hashed_password_2', 'rBob5678XRPWalletAddress');

-- Seed projects
INSERT INTO projects (title, creator, category, description, raised, goal, backers, days_left, badge, front_pic, is_featured, is_recommended, is_popular) VALUES
  (
    'Symphonic Futures: An AI-Augmented Orchestra',
    'Elara Sounds Collective',
    'Music',
    'We''re blending live orchestral performance with generative AI composition to produce an entirely new genre of concert experience.',
    87400, 120000, 742, 18, 'Staff Pick',
    'https://media.cnn.com/api/v1/images/stellar/prod/140312125126-robot-musicians.jpg?q=w_4776,h_3164,x_0,y_0,c_fill',
    TRUE, FALSE, FALSE
  ),
  (
    'Luminary — A Solar-Powered Film Studio Kit',
    'OffGrid Cinema',
    'Film & Video',
    'A portable, solar-powered production kit that lets indie filmmakers shoot anywhere on Earth without a generator.',
    210000, 250000, 1830, 31, 'Editor''s Choice',
    'https://i.ytimg.com/vi/pcj2lQwH7N4/maxresdefault.jpg',
    TRUE, FALSE, FALSE
  ),
  (
    'Rootbound: An Illustrated Novel About Migration',
    'Amara Diallo',
    'Publishing',
    'A deeply personal illustrated novel following three generations of a West African family as they navigate belonging across continents.',
    34200, 45000, 391, 9, 'Trending',
    'https://i.natgeofe.com/n/ca67be17-759d-40dc-8e13-e23506639500/01-migration-reference.jpg',
    TRUE, FALSE, FALSE
  ),
  (
    'Mycelium Map: A Fungi Photography Book',
    'Petra Wilde',
    'Photography',
    'Macro photography documenting over 400 species of fungi across six continents.',
    12800, 20000, 214, 22, NULL,
    'https://cdn.britannica.com/90/236590-050-27422B8D/Close-up-of-mushroom-growing-on-field.jpg',
    FALSE, TRUE, FALSE
  ),
  (
    'Forge & Fable: Tabletop RPG Expansion Set',
    'Ironroot Games',
    'Games',
    'Sixty new cards, five new character classes, and an entirely new campaign arc for the Forge & Fable universe.',
    55000, 60000, 987, 5, NULL,
    'https://www.adventureawaits.com.au/cdn/shop/products/catanplaying.jpg?v=1614161731',
    FALSE, TRUE, FALSE
  ),
  (
    'Urban Bloom — Vertical Garden Sculpture',
    'Studio Verd',
    'Art',
    'A living wall sculpture designed for urban apartments, merging art installation with functional plant care.',
    9100, 15000, 163, 40, NULL,
    'https://www.palasa.co.in/cdn/shop/articles/vertical_garden.png?v=1696489616',
    FALSE, TRUE, FALSE
  ),
  (
    'Resonance: Interactive Sound Installation',
    'Kael & the Void Ensemble',
    'Music',
    'An immersive walk-through sound installation triggered by visitor movement, debuting at three cities.',
    28700, 35000, 455, 14, NULL,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzg6hbUU3Z3Rm_LQypBjk8ohjaiLxByEf7NQ&s',
    FALSE, TRUE, FALSE
  ),
  (
    'The Deep Blue Cookbook',
    'Chef Mariana Costa',
    'Food & Craft',
    'Sustainable ocean-to-table recipes from coastal communities around the world.',
    68000, 70000, 1204, 3, NULL,
    'https://images.pexels.com/photos/29617469/pexels-photo-29617469.png',
    FALSE, FALSE, TRUE
  ),
  (
    'Phantom Circuit: A Graphic Novel',
    'Nox Studio',
    'Comics',
    'A cyberpunk graphic novel set in a city run entirely by autonomous AI factions.',
    43500, 50000, 822, 12, NULL,
    'https://images.pexels.com/photos/31002084/pexels-photo-31002084.jpeg',
    FALSE, FALSE, TRUE
  ),
  (
    'Prairie Wind — Independent Documentary',
    'Highgrass Films',
    'Film & Video',
    'A documentary following four families who left cities to homestead on America''s disappearing prairies.',
    31000, 40000, 560, 19, NULL,
    'https://images.pexels.com/photos/325944/pexels-photo-325944.jpeg',
    FALSE, FALSE, TRUE
  ),
  (
    'Codeweave: Learn to Code Through Embroidery',
    'Thread & Logic',
    'Education',
    'A physical kit that teaches programming logic through colourful embroidery patterns — no screen required.',
    19200, 25000, 348, 27, NULL,
    'https://images.pexels.com/photos/3772487/pexels-photo-3772487.jpeg',
    FALSE, FALSE, TRUE
  ),
  (
    'Solstice: A Board Game of Seasons',
    'Hearth Games Co.',
    'Games',
    'A 2–5 player strategy game where players guide civilizations through 1,000 years of seasonal change.',
    92000, 100000, 1650, 8, NULL,
    'https://images.pexels.com/photos/776654/pexels-photo-776654.jpeg',
    FALSE, FALSE, TRUE
  ),
  (
    'Ink & Memory: Handmade Artist Journals',
    'Paperbound Studio',
    'Art',
    'Handcrafted, ethically sourced journals with hand-marbled covers made by artisans in Oaxaca, Mexico.',
    14600, 18000, 270, 33, NULL,
    'https://images.pexels.com/photos/2874998/pexels-photo-2874998.jpeg',
    FALSE, FALSE, TRUE
  );
