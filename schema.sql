DROP TABLE IF EXISTS movietable;

CREATE TABLE IF NOT EXISTS  movietable  (
    
    id serial primary key,
    title varchar(255),

    myrate varchar(255)

);