CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  hobbies TEXT,
  interests TEXT,
  zip VARCHAR(9) NOT NULL
);

CREATE TABLE friends(
  id SERIAL PRIMARY KEY,
  user_1 VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,  
  user_2 VARCHAR(25)
  REFERENCES users ON DELETE CASCADE  
);

CREATE TABLE likes(
  id SERIAL PRIMARY KEY,
  user_username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,  
  likes VARCHAR(25)
    REFERENCES users ON DELETE CASCADE
);