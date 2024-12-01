Steps : 

1. CLone Repo.
2. Download and install docker
3. open j0 folder and cmd from that folder and enter given commands
    docker-compose up -d db redis redis2
       (wait for sometime to setup)
    docker-compose up -d
4. Now setup database, i suggest copy database queries from backend -> src -> model -> db.sql and setup an empty database
5. now update env file according to the your mysql password and database name
6. run backend and frontend (npm run dev)
