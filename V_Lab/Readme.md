# Judge0 setup:
- docker-compose up -d db redis redis2
- wait for sometime to setup
- docker-compose up -d

# Project Set up


# set up database

0. Create database virtual in mysql
1. Set .env file
2. npm run db:generate
3. npm run db:push
4. npm run db:seed

DROP DATABASE v_lab_seed;
CREATE DATABASE v_lab_seed;

