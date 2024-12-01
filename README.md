***Steps :***
    1. CLone Repo.
    2. Download and install docker
    3. open j0 folder and cmd from that folder and enter given commands
        docker-compose up -d db redis redis2
           (wait for sometime to setup)
        docker-compose up -d
    4. Now setup database, i suggest copy database queries from backend -> src -> model -> db.sql and setup an empty database
        (remember : programming language table you have to copy from prev. db )
    5. now update env file according to the your mysql password and database name
       .env file : (create .env and copy below lines into it)
            PORT=5000
            NODE_ENV=development
            MYSQL_HOST="localhost"
            MYSQL_PORT=3306
            MYSQL_USER="root"
            MYSQL_PASSWORD="12345"
            MYSQL_DATABASE="v_lab_seed2"
            JUDGE0_API_URL="http://localhost:2358"
            REDIS_URL="redis://localhost:6380"
            REDIS_PASSWORD="123"
            REDIS_HOST="localhost"
            REDIS_PORT="6380"
    7. run backend and frontend (npm run dev)

***Steps to Use after run application :***
    - add mannually one user as a 'Admin' into user table
    - login as a admin
    - go to faculty page and add hod for that department
    - logout admin and login any one hod for department 
    - add faculty for that department 
    - create course for any semester
    - go to batch page and add batch for that semeter 
    - run application on any other incognito window side by side and register as a student 
    - register student in same sem which we created 
    - login student 
    - login faculty login and add practical 
    
    

***Testing :***

